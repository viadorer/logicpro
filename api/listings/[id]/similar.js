import { supabase } from "../../../lib/supabase.js";

export default async function handler(req, res) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  const { data: listing, error } = await supabase
    .from("listings")
    .select("advert_subtype, locality_city")
    .eq("id", id)
    .single();

  if (error || !listing) return res.status(404).json({ error: "Not found" });

  const { data: rows } = await supabase
    .from("listings")
    .select("*, listing_images!left(url, is_main)")
    .neq("id", id)
    .or(`advert_subtype.eq.${listing.advert_subtype},locality_city.eq.${listing.locality_city}`)
    .limit(3);

  const listings = (rows || []).map((l) => {
    const mainImg = l.listing_images?.find((i) => i.is_main === 1);
    return {
      ...l,
      main_image: mainImg?.url || l.listing_images?.[0]?.url || null,
      listing_images: undefined,
    };
  });

  res.json({ listings });
}
