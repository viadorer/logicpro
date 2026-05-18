// =====================================================================
// Sidecar (property_extensions) query helper.
// =====================================================================
// Tabulka `property_extensions` — viz supabase/migration_4_nemovizor_sidecar.sql.
// Drží:
//   - industrial fieldy autoritativní (LogicPro vlastní)
//   - hot mirror core poli z Nemovizoru (denormalizace pro filter perf)
//   - sync metadata
//
// Použití:
//   const sidecars = await fetchSidecarBatch(res, ["uuid1","uuid2"]);
//   const row = await fetchSidecarOne(res, "uuid");
//
// Pokud sidecar řádek neexistuje, vrací null / chybí v Map — handler
// pak má jen Nemovizor core data, industrial fieldy zůstanou null.
// =====================================================================

import { requireSupabase } from "./supabase.js";

const ALL_COLUMNS = "*";

/**
 * Batch fetch — pro listings stránku.
 * Vrací Map { property_id → row }.
 */
export async function fetchSidecarBatch(res, propertyIds = []) {
  const ids = (propertyIds || []).filter(Boolean);
  if (ids.length === 0) return new Map();

  const supabase = requireSupabase(res);
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from("property_extensions")
    .select(ALL_COLUMNS)
    .in("property_id", ids);

  if (error) {
    console.warn("[sidecar] batch fetch failed:", error.message);
    return new Map();
  }
  return new Map((data || []).map((row) => [row.property_id, row]));
}

/**
 * Single fetch — pro detail page.
 */
export async function fetchSidecarOne(res, propertyId) {
  if (!propertyId) return null;
  const m = await fetchSidecarBatch(res, [propertyId]);
  return m.get(propertyId) ?? null;
}

/**
 * Lookup sidecar řádku podle hot-mirror sloupců (např. legacy int ID pro
 * 301 redirect). Vrátí celý sidecar řádek nebo null.
 */
export async function findSidecarByLegacyId(res, legacyLogicproId) {
  const id = Number(legacyLogicproId);
  if (!Number.isFinite(id)) return null;
  const supabase = requireSupabase(res);
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("property_extensions")
    .select("property_id, legacy_logicpro_id")
    .eq("legacy_logicpro_id", id)
    .maybeSingle();

  if (error) {
    console.warn("[sidecar] legacy lookup failed:", error.message);
    return null;
  }
  return data ?? null;
}

/**
 * Industrial filter — vrátí pole property_id, které vyhovují industrial
 * kritériím. Používá hot mirror sloupce + industrial fieldy v sidecaru.
 *
 * Vrací `null`, pokud žádný industrial filter nebyl zadán (= "vše projde").
 * Vrací prázdné pole, pokud nikdo nevyhovuje.
 *
 * Volání:
 *   const allowedIds = await sidecarIndustrialFilter(res, {
 *     building_class: 1,
 *     floor_load_min: 5000,
 *     sub_type_local: ["logistika", "retail_park"],
 *   });
 *   if (allowedIds !== null) {
 *     properties = properties.filter((p) => allowedIds.includes(p.id));
 *   }
 */
export async function sidecarIndustrialFilter(res, filters = {}) {
  const {
    building_class,
    floor_load_min,
    certification,
    loading_docks_min,
    ceiling_height_min,
    ceiling_height_max,
    sub_type_local,
  } = filters;

  const hasAny =
    building_class != null ||
    floor_load_min != null ||
    certification ||
    loading_docks_min != null ||
    ceiling_height_min != null ||
    ceiling_height_max != null ||
    (Array.isArray(sub_type_local) && sub_type_local.length > 0);

  if (!hasAny) return null;

  const supabase = requireSupabase(res);
  if (!supabase) return [];

  let q = supabase.from("property_extensions").select("property_id");

  if (building_class != null) q = q.eq("building_class", Number(building_class));
  if (floor_load_min != null) q = q.gte("floor_load", Number(floor_load_min));
  if (certification) q = q.not("certification", "is", null);
  if (loading_docks_min != null) q = q.gte("loading_docks", Number(loading_docks_min));
  if (ceiling_height_min != null) q = q.gte("ceiling_height", Number(ceiling_height_min));
  if (ceiling_height_max != null) q = q.lte("ceiling_height", Number(ceiling_height_max));
  if (Array.isArray(sub_type_local) && sub_type_local.length > 0) {
    q = q.in("sub_type_local", sub_type_local);
  }

  // Jen aktivní/rezervované (hot mirror status)
  q = q.in("mirror_status", ["active", "reserved"]);

  const { data, error } = await q;
  if (error) {
    console.warn("[sidecar] industrial filter failed:", error.message);
    return [];
  }
  return (data || []).map((r) => r.property_id);
}
