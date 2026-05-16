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
