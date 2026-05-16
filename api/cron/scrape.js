// Vercel Cron entry point pro denni scraping.
// Konfigurace v vercel.json: { "crons": [{ "path": "/api/cron/scrape", "schedule": "0 3 * * *" }] }
//
// Vercel Cron volá tento endpoint denně ve 3:00 UTC. Vyzaduje CRON_SECRET
// jako Authorization Bearer token, aby endpoint nešel zavolat zvenku.
//
// Spousti scraper pouze "lehkou" verzi — fetch + upsert pres Supabase REST.
// Pro pomalejsi/uplny scraping je lepsi GitHub Action s npm run scrape:108.

import { requireSupabase } from "../../lib/supabase.js";

const PER_PAGE = 50;
const COMPANY_ID = 199; // 108 REAL ESTATE
const SREALITY = "https://www.sreality.cz/api/cs/v2";
const UA = "Mozilla/5.0 (compatible; LogicProBot/1.0; +https://logicpro.cz)";
const MAX_PAGES = 10; // safety cap

async function fetchEstates(page) {
  const r = await fetch(
    `${SREALITY}/estates?company=${COMPANY_ID}&per_page=${PER_PAGE}&page=${page}`,
    {
      headers: { "User-Agent": UA, "Accept": "application/json" },
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!r.ok) throw new Error(`Sreality HTTP ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  // Authorization — Vercel Cron pridava `Authorization: Bearer <CRON_SECRET>`
  const auth = req.headers.authorization || "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = requireSupabase(res);
  if (!supabase) return;

  const seenExternalIds = new Set();
  let totalUpdated = 0;
  let totalArchived = 0;
  const errors = [];

  try {
    // 1. Stahnout seznam (lehky data, jen hash_id + name + lokality)
    const allEstates = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      try {
        const data = await fetchEstates(page);
        const estates = data?._embedded?.estates ?? [];
        if (!estates.length) break;
        allEstates.push(...estates);
        if (allEstates.length >= (data.result_size || Infinity)) break;
      } catch (e) {
        errors.push(`Page ${page}: ${e.message}`);
        break;
      }
    }

    // 2. Update last_seen_at + status='active' pro vsechny videne external_id.
    //    Detail uz nestahujeme — to dela `npm run scrape:108` z GitHub Action.
    //    Tady jen drzime "ten inzerat jeste na Sreality existuje".
    const now = new Date().toISOString();
    for (const est of allEstates) {
      const hid = String(est.hash_id);
      seenExternalIds.add(hid);
      const { error } = await supabase
        .from("listings")
        .update({ last_seen_at: now, status: "active" })
        .eq("source", "sreality-108")
        .eq("external_id", hid);
      if (!error) totalUpdated++;
    }

    // 3. Soft-archive — last_seen_at > 24h ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: stale } = await supabase
      .from("listings")
      .select("id, external_id")
      .eq("source", "sreality-108")
      .eq("status", "active")
      .lt("last_seen_at", cutoff);

    const toArchive = (stale || [])
      .filter((r) => !seenExternalIds.has(String(r.external_id)))
      .map((r) => r.id);

    if (toArchive.length) {
      const { error } = await supabase
        .from("listings")
        .update({ status: "archived" })
        .in("id", toArchive);
      if (!error) totalArchived = toArchive.length;
    }

    res.status(200).json({
      ok: true,
      seen: seenExternalIds.size,
      updated: totalUpdated,
      archived: totalArchived,
      errors,
      timestamp: now,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, errors });
  }
}

// Cron typicky bezi dele nez default 10s timeout — povolime 60s.
export const config = { maxDuration: 60 };
