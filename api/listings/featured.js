import { requireSupabase } from "../../lib/supabase.js";
import { getDataSource } from "../../lib/data-source.js";
import { nemovizor, NemovizorError } from "../../lib/nemovizor.js";
import { fetchSidecarBatch } from "../../lib/sidecar.js";
import { toLogicProShape } from "../../lib/nemovizor-codebooks.js";

// ─── Nemovizor variant ────────────────────────────────────────────────────
// V1: featured = 3 nejnovejsi komercni listingy.
// V2: pridat sidecar sloupec `is_featured` + admin UI pro ruzny pin order.
async function handlerNemovizor(req, res) {
  try {
    const resp = await nemovizor.searchProperties({
      category: "commercial",
      sort: "newest",
      limit: 3,
    });
    const props = resp.data || [];
    const sidecars = await fetchSidecarBatch(res, props.map((p) => p.id));
    const listings = props.map((p) => {
      const merged = toLogicProShape(p, sidecars.get(p.id));
      const mainImg = merged.listing_images?.find((i) => i.is_main) ?? merged.listing_images?.[0];
      return { ...merged, main_image: mainImg?.url || null, listing_images: undefined };
    });

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.setHeader("X-Data-Source", "nemovizor");
    return res.json({ listings });
  } catch (err) {
    if (err instanceof NemovizorError) {
      console.warn("[featured] Nemovizor failed:", err.status);
      return res.status(502).json({ error: "Upstream API unavailable" });
    }
    throw err;
  }
}

// ─── Original Supabase variant ────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (getDataSource() === "nemovizor") {
    return handlerNemovizor(req, res);
  }

  const supabase = requireSupabase(res);
  if (!supabase) return;

  // LEFT join — chceme i listingy bez fotky, hlavni obrazek pak vybereme v JS.
  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      "id, title, advert_function, advert_subtype, advert_price, advert_price_currency, advert_price_unit, locality_city, locality_citypart, usable_area, estate_area, listing_images!left(url, is_main, sort_order)"
    )
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) return res.status(500).json({ error: error.message });

  const rows = (listings || []).map((l) => {
    const imgs = (l.listing_images || []).slice().sort((a, b) => {
      if (a.is_main !== b.is_main) return (b.is_main || 0) - (a.is_main || 0);
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    return {
      ...l,
      main_image: imgs[0]?.url || null,
      listing_images: undefined,
    };
  });

  // Vratime prvni 3 — featured je male.
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
  res.json({ listings: rows.slice(0, 3) });
}
