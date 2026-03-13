import { supabase } from "../../lib/supabase.js";

export default async function handler(_req, res) {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*, listing_images!inner(url)")
    .eq("listing_images.is_main", 1)
    .order("id", { ascending: true })
    .limit(3);

  if (error) return res.status(500).json({ error: error.message });

  const rows = listings.map((l) => ({
    ...l,
    main_image: l.listing_images?.[0]?.url || null,
    listing_images: undefined,
  }));

  res.json({ listings: rows });
}
