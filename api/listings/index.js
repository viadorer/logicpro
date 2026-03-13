import { supabase } from "../../lib/supabase.js";

export default async function handler(req, res) {
  const {
    advert_function, advert_subtype, locality_city,
    area_min, area_max, price_min, price_max,
    building_class, floor_load, certification,
    loading_docks_min, ceiling_height_min, ceiling_height_max,
    sort, limit: lim, offset: off,
  } = req.query;

  const limit = Number(lim) || 20;
  const offset = Number(off) || 0;

  // Build query
  let query = supabase
    .from("listings")
    .select("*, listing_images!left(url, is_main)", { count: "exact" });

  if (advert_function) query = query.eq("advert_function", Number(advert_function));
  if (advert_subtype) {
    const subs = advert_subtype.split(",").map(Number).filter(Boolean);
    if (subs.length) query = query.in("advert_subtype", subs);
  }
  if (locality_city) query = query.eq("locality_city", locality_city);
  if (price_min) query = query.gte("advert_price", Number(price_min));
  if (price_max) query = query.lte("advert_price", Number(price_max));
  if (building_class) query = query.eq("building_class", Number(building_class));
  if (floor_load) query = query.gte("floor_load", Number(floor_load));
  if (certification) query = query.not("certification", "is", null);
  if (loading_docks_min) query = query.gte("loading_docks", Number(loading_docks_min));
  if (ceiling_height_min) query = query.gte("ceiling_height", Number(ceiling_height_min));
  if (ceiling_height_max) query = query.lte("ceiling_height", Number(ceiling_height_max));

  // Area filter — use usable_area or estate_area
  if (area_min) {
    query = query.or(`usable_area.gte.${Number(area_min)},estate_area.gte.${Number(area_min)}`);
  }
  if (area_max) {
    query = query.or(`usable_area.lte.${Number(area_max)},estate_area.lte.${Number(area_max)}`);
  }

  // Sorting
  const sortMap = {
    price_asc: { column: "advert_price", ascending: true },
    price_desc: { column: "advert_price", ascending: false },
    area_asc: { column: "usable_area", ascending: true },
    area_desc: { column: "usable_area", ascending: false },
    newest: { column: "created_at", ascending: false },
  };
  const sortOpt = sortMap[sort] || { column: "id", ascending: true };
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

  res.json({ total: count || 0, listings });
}
