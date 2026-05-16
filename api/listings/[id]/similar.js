import { requireSupabase } from "../../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
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
