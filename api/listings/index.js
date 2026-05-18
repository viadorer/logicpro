import { requireSupabase } from "../../lib/supabase.js";
import { getDataSource } from "../../lib/data-source.js";
import { nemovizor, NemovizorError } from "../../lib/nemovizor.js";
import { fetchSidecarBatch } from "../../lib/sidecar.js";
import {
  LISTING_TYPE_TO_NEMOVIZOR,
  SUBTYPE_TO_NEMOVIZOR,
  LEGACY_TO_SUB_TYPE_LOCAL,
  toLogicProShape,
} from "../../lib/nemovizor-codebooks.js";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const ALLOWED_SORTS = {
  price_asc: { column: "advert_price", ascending: true },
  price_desc: { column: "advert_price", ascending: false },
  area_asc: { column: "usable_area", ascending: true },
  area_desc: { column: "usable_area", ascending: false },
  newest: { column: "created_at", ascending: false },
};

const NEMOVIZOR_SORT = {
  price_asc: "price_asc",
  price_desc: "price_desc",
  area_asc: "area_asc",
  area_desc: "area_desc",
  newest: "newest",
};

function intParam(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ─── Nemovizor variant ────────────────────────────────────────────────────
async function handlerNemovizor(req, res) {
  const {
    advert_function, advert_subtype, locality_city,
    area_min, area_max, price_min, price_max,
    building_class, floor_load, certification,
    loading_docks_min, ceiling_height_min, ceiling_height_max,
    sort, limit: lim, offset: off,
  } = req.query;

  const limit = Math.min(Math.max(intParam(lim) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(intParam(off) || 0, 0);

  // Mapuj LogicPro int kódy → Nemovizor slugy
  const query = { category: "commercial", limit, offset };

  if (advert_function) {
    const slug = LISTING_TYPE_TO_NEMOVIZOR[intParam(advert_function)];
    if (slug) query.listingType = slug;
  }

  // Granular sub_type_local (50-55) potřebuje sidecar post-filter
  const requestedSubLocal = new Set();
  if (advert_subtype) {
    const subs = String(advert_subtype).split(",").map(intParam).filter(Boolean);
    const mapped = new Set();
    for (const s of subs) {
      const slug = SUBTYPE_TO_NEMOVIZOR[s];
      if (slug) mapped.add(slug);
      const local = LEGACY_TO_SUB_TYPE_LOCAL[s];
      if (local) requestedSubLocal.add(local);
    }
    if (mapped.size) query.subtype = [...mapped].join(",");
  }

  if (locality_city) query.city = String(locality_city);
  if (price_min) query.priceMin = intParam(price_min);
  if (price_max) query.priceMax = intParam(price_max);
  if (area_min) query.areaMin = intParam(area_min);
  if (area_max) query.areaMax = intParam(area_max);
  if (sort && NEMOVIZOR_SORT[sort]) query.sort = NEMOVIZOR_SORT[sort];

  // Pokud user filtruje na industrial fieldy nebo granular subtype,
  // overfetchneme z Nemovizoru a po-filtrujeme přes sidecar.
  const hasIndustrialFilter =
    building_class || floor_load || certification ||
    loading_docks_min || ceiling_height_min || ceiling_height_max ||
    requestedSubLocal.size > 0;

  if (hasIndustrialFilter) {
    query.limit = Math.min(limit * 5, MAX_LIMIT);
    query.offset = 0; // při industrial filteru je pagination přibližná
  }

  let nemoResp;
  try {
    nemoResp = await nemovizor.searchProperties(query);
  } catch (err) {
    if (err instanceof NemovizorError) {
      console.warn("[listings] Nemovizor failed:", err.status, err.message);
      return res.status(err.status >= 500 ? 502 : err.status || 502)
        .json({ error: "Upstream API unavailable" });
    }
    throw err;
  }

  const properties = nemoResp.data || [];
  const ids = properties.map((p) => p.id).filter(Boolean);
  const sidecars = await fetchSidecarBatch(res, ids);

  let merged = properties.map((p) => toLogicProShape(p, sidecars.get(p.id)));

  // Post-filter industrial fieldy (sidecar autoritativní)
  if (building_class) {
    const v = intParam(building_class);
    merged = merged.filter((r) => r.building_class === v);
  }
  if (floor_load) {
    const v = intParam(floor_load);
    merged = merged.filter((r) => r.floor_load != null && r.floor_load >= v);
  }
  if (certification) {
    merged = merged.filter((r) => Array.isArray(r.certification) && r.certification.length > 0);
  }
  if (loading_docks_min) {
    const v = intParam(loading_docks_min);
    merged = merged.filter((r) => (r.loading_docks ?? 0) >= v);
  }
  if (ceiling_height_min) {
    const v = Number(ceiling_height_min);
    merged = merged.filter((r) => (r.ceiling_height ?? 0) >= v);
  }
  if (ceiling_height_max) {
    const v = Number(ceiling_height_max);
    merged = merged.filter((r) => r.ceiling_height == null || r.ceiling_height <= v);
  }
  if (requestedSubLocal.size > 0) {
    merged = merged.filter((r) => r.sub_type_local && requestedSubLocal.has(r.sub_type_local));
  }

  // Při industrial filteru ručně ořízneme na limit+offset (overfetch fix)
  if (hasIndustrialFilter) {
    merged = merged.slice(offset, offset + limit);
  }

  // Doplň main_image pro UI (existující shape ze Supabase varianty)
  const listings = merged.map((l) => {
    const mainImg = l.listing_images?.find((i) => i.is_main) ?? l.listing_images?.[0];
    return { ...l, main_image: mainImg?.url || null, listing_images: undefined };
  });

  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60");
  res.setHeader("X-Data-Source", "nemovizor");
  return res.json({
    total: hasIndustrialFilter ? listings.length + offset : (nemoResp.total ?? listings.length),
    listings,
    limit,
    offset,
    industrial_filter_applied: Boolean(hasIndustrialFilter),
  });
}

// ─── Original Supabase variant (unchanged below) ──────────────────────────
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

  const {
    advert_function, advert_subtype, locality_city,
    area_min, area_max, price_min, price_max,
    building_class, floor_load, certification,
    loading_docks_min, ceiling_height_min, ceiling_height_max,
    sort, limit: lim, offset: off,
  } = req.query;

  const limit = Math.min(Math.max(intParam(lim) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(intParam(off) || 0, 0);

  // Tenky select — celou listing tabulku tahat nemusime,
  // listing card potrebuje jen nekolik sloupcu a hlavni fotku.
  let query = supabase
    .from("listings")
    .select(
      "id, title, advert_function, advert_subtype, advert_price, advert_price_currency, advert_price_unit, locality_city, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, building_class, certification, ceiling_height, listing_images!left(url, is_main)",
      { count: "exact" }
    );

  if (advert_function) query = query.eq("advert_function", intParam(advert_function));
  if (advert_subtype) {
    const subs = String(advert_subtype).split(",").map(intParam).filter(Boolean);
    if (subs.length) query = query.in("advert_subtype", subs);
  }
  if (locality_city) query = query.eq("locality_city", String(locality_city));
  if (price_min) query = query.gte("advert_price", intParam(price_min));
  if (price_max) query = query.lte("advert_price", intParam(price_max));
  if (building_class) query = query.eq("building_class", intParam(building_class));
  if (floor_load) query = query.gte("floor_load", intParam(floor_load));
  if (certification) query = query.not("certification", "is", null);
  if (loading_docks_min) query = query.gte("loading_docks", intParam(loading_docks_min));
  if (ceiling_height_min) query = query.gte("ceiling_height", Number(ceiling_height_min));
  if (ceiling_height_max) query = query.lte("ceiling_height", Number(ceiling_height_max));

  // Plocha — drive jsme pouzili dva `.or()` za sebou, coz PostgREST
  // skladal s puvodnimi filtry chybne. Filtrujeme pres COALESCE
  // virtualne tak, ze area_min/max plati pro vyssi z usable/estate.
  // V Supabase to vyresime tim, ze pokud uzivatel zada area_min,
  // chceme aby PROSEL listing kde max(usable_area, estate_area) >= area_min.
  // PostgREST to umi pres `.or()` JEDNOU + dalsi filtry zustanou v AND.
  if (area_min) {
    const v = intParam(area_min);
    query = query.or(`usable_area.gte.${v},estate_area.gte.${v}`);
  }
  if (area_max) {
    const v = intParam(area_max);
    // POZN: Pri kombinaci s area_min by druhe `.or()` prepsalo prvni.
    // Pokud je nastaven jen area_max, platí omezeni shora;
    // pokud je nastaven OBOJI, pouzijeme jen area_min (range OR by se musel resit RPC).
    if (!area_min) query = query.or(`usable_area.lte.${v},estate_area.lte.${v}`);
    else query = query.lte("usable_area", v);
  }

  const sortOpt = ALLOWED_SORTS[sort] || { column: "id", ascending: false };
  query = query.order(sortOpt.column, { ascending: sortOpt.ascending });
  query = query.range(offset, offset + limit - 1);

  const { data: rows, count, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const listings = (rows || []).map((l) => {
    const mainImg = l.listing_images?.find((i) => i.is_main === 1);
    return {
      ...l,
      main_image: mainImg?.url || l.listing_images?.[0]?.url || null,
      listing_images: undefined,
    };
  });

  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60");
  res.json({ total: count || 0, listings, limit, offset });
}
