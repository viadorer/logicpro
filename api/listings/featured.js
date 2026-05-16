import { requireSupabase } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
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
