import { supabase } from "../../../lib/supabase.js";

export default async function handler(req, res) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  const { data: row, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) return res.status(404).json({ error: "Not found" });

  const { data: imgs } = await supabase
    .from("listing_images")
    .select("*")
    .eq("listing_id", id)
    .order("is_main", { ascending: false })
    .order("sort_order", { ascending: true });

  const data = { ...row, images: imgs || [] };
  if (data.features && typeof data.features === "string") {
    try { data.features = JSON.parse(data.features); } catch {}
  }

  res.json(data);
}
