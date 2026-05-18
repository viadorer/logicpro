import { requireSupabase } from "../../../lib/supabase.js";
import { getDataSource } from "../../../lib/data-source.js";
import { nemovizor, NemovizorError } from "../../../lib/nemovizor.js";
import { fetchSidecarBatch, findSidecarByLegacyId } from "../../../lib/sidecar.js";
import { toLogicProShape } from "../../../lib/nemovizor-codebooks.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Nemovizor variant ────────────────────────────────────────────────────
async function handlerNemovizor(req, res) {
  const raw = String(req.query.id || "").trim();
  if (!raw) return res.status(400).json({ error: "Invalid id" });

  let uuid;
  try {
    if (/^\d+$/.test(raw)) {
      const side = await findSidecarByLegacyId(res, raw);
      if (!side) return res.status(404).json({ error: "Not found" });
      uuid = side.property_id;
    } else if (UUID_RE.test(raw)) {
      uuid = raw;
    } else {
      // Slug -> resolve to UUID via by-slug fetch
      const resp = await nemovizor.getPropertyBySlug(raw);
      uuid = (resp.data ?? resp)?.id;
      if (!uuid) return res.status(404).json({ error: "Not found" });
    }

    const sim = await nemovizor.getSimilar(uuid);
    const props = sim.data || [];
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
      if (err.status === 404) return res.json({ listings: [] });
      console.warn("[similar] Nemovizor failed:", err.status);
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

  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("advert_subtype, locality_city, advert_function")
    .eq("id", id)
    .single();

  if (error || !listing) return res.status(404).json({ error: "Not found" });

  // Subtype + same city, nebo same subtype kdekoliv. Soft logic.
  const subtype = Number(listing.advert_subtype);
  const city = listing.locality_city;

  let q = supabase
    .from("listings")
    .select("id, title, advert_function, advert_subtype, advert_price, advert_price_currency, advert_price_unit, locality_city, usable_area, estate_area, listing_images!left(url, is_main)")
    .neq("id", id);

  // Bezpecne — subtype je integer, city escape neni potreba (eq prijima string parametricky)
  if (Number.isInteger(subtype) && city) {
    q = q.or(`advert_subtype.eq.${subtype},locality_city.eq."${city.replace(/"/g, '')}"`);
  } else if (Number.isInteger(subtype)) {
    q = q.eq("advert_subtype", subtype);
  } else if (city) {
    q = q.eq("locality_city", city);
  }

  const { data: rows } = await q.limit(3);

  const listings = (rows || []).map((l) => {
    const mainImg = l.listing_images?.find((i) => i.is_main === 1);
    return {
      ...l,
      main_image: mainImg?.url || l.listing_images?.[0]?.url || null,
      listing_images: undefined,
    };
  });

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.json({ listings });
}
