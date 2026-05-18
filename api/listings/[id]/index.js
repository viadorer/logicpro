import { requireSupabase } from "../../../lib/supabase.js";
import { getDataSource } from "../../../lib/data-source.js";
import { nemovizor, NemovizorError } from "../../../lib/nemovizor.js";
import { fetchSidecarOne, findSidecarByLegacyId } from "../../../lib/sidecar.js";
import { toLogicProShape } from "../../../lib/nemovizor-codebooks.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Nemovizor variant ────────────────────────────────────────────────────
// Detail prijima int (legacy), UUID, nebo slug. Dispatch:
//   - vse cislo  -> sidecar lookup po legacy_logicpro_id -> getProperty(uuid)
//   - UUID       -> getProperty(uuid)
//   - jinak slug -> getPropertyBySlug(slug)
async function handlerNemovizor(req, res) {
  const raw = String(req.query.id || "").trim();
  if (!raw || raw.length > 300) {
    return res.status(400).json({ error: "Invalid id" });
  }

  let property;
  try {
    if (/^\d+$/.test(raw)) {
      // legacy int -> sidecar lookup
      const side = await findSidecarByLegacyId(res, raw);
      if (!side) return res.status(404).json({ error: "Not found" });
      const resp = await nemovizor.getProperty(side.property_id);
      property = resp.data ?? resp;
    } else if (UUID_RE.test(raw)) {
      const resp = await nemovizor.getProperty(raw);
      property = resp.data ?? resp;
    } else {
      const resp = await nemovizor.getPropertyBySlug(raw);
      property = resp.data ?? resp;
    }
  } catch (err) {
    if (err instanceof NemovizorError) {
      if (err.status === 404) return res.status(404).json({ error: "Not found" });
      return res.status(err.status >= 500 ? 502 : err.status || 502)
        .json({ error: "Upstream API unavailable" });
    }
    throw err;
  }

  if (!property) return res.status(404).json({ error: "Not found" });

  const sidecar = await fetchSidecarOne(res, property.id);
  const merged = toLogicProShape(property, sidecar);

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.setHeader("X-Data-Source", "nemovizor");
  return res.json(merged);
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

  const { data: row, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) return res.status(404).json({ error: "Not found" });

  const { data: imgs } = await supabase
    .from("listing_images")
    .select("id, url, alt, is_main, sort_order")
    .eq("listing_id", id)
    .order("is_main", { ascending: false })
    .order("sort_order", { ascending: true });

  const data = { ...row, images: imgs || [] };
  if (data.features && typeof data.features === "string") {
    try { data.features = JSON.parse(data.features); } catch { /* nech to byt string */ }
  }

  // search_vector v API odpovedi nepotrebujeme — je to interni sloupec.
  delete data.search_vector;

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.json(data);
}
