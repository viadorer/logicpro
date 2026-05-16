import { requireSupabase } from "../lib/supabase.js";

const STATIC_URLS = [
  { loc: "/", priority: 1.0, changefreq: "daily" },
  { loc: "/nabidky", priority: 0.9, changefreq: "daily" },
  { loc: "/knowledge-base", priority: 0.5, changefreq: "weekly" },
];

function xmlEscape(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const supabase = requireSupabase(res);
  if (!supabase) return;

  const base = (process.env.PUBLIC_SITE_URL || "https://logicpro.cz").replace(/\/$/, "");

  // Vsechny aktivni listingy
  const { data: listings } = await supabase
    .from("listings")
    .select("id, slug, updated_at, status")
    .in("status", ["active", "reserved"])
    .order("updated_at", { ascending: false })
    .limit(5000);

  const now = new Date().toISOString();
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const u of STATIC_URLS) {
    parts.push("<url>");
    parts.push(`<loc>${base}${u.loc}</loc>`);
    parts.push(`<lastmod>${now}</lastmod>`);
    parts.push(`<changefreq>${u.changefreq}</changefreq>`);
    parts.push(`<priority>${u.priority}</priority>`);
    parts.push("</url>");
  }

  for (const l of listings || []) {
    const path = l.slug ? `/detail/${l.id}` : `/detail/${l.id}`;
    parts.push("<url>");
    parts.push(`<loc>${base}${path}</loc>`);
    parts.push(`<lastmod>${xmlEscape(l.updated_at || now)}</lastmod>`);
    parts.push("<changefreq>weekly</changefreq>");
    parts.push("<priority>0.7</priority>");
    parts.push("</url>");
  }
  parts.push("</urlset>");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).send(parts.join("\n"));
}
