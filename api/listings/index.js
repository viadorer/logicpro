import { requireSupabase } from "../../lib/supabase.js";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const ALLOWED_SORTS = {
  price_asc: { column: "advert_price", ascending: true },
  price_desc: { column: "advert_price", ascending: false },
  area_asc: { column: "usable_area", ascending: true },
  area_desc: { column: "usable_area", ascending: false },
  newest: { column: "created_at", ascending: false },
};

function intParam(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
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
