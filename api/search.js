import { requireSupabase } from "../lib/supabase.js";

/**
 * Sanitizuje uzivatelsky vstup pro pouziti v PostgREST `or()` filtru.
 * Odstrani znaky, kterymi by se dal filtr rozsirit nebo zlomit.
 * Viz: https://postgrest.org/en/stable/api.html#operators
 */
function sanitizeQuery(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[,()*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = requireSupabase(res);
  if (!supabase) return;

  const q = sanitizeQuery(req.query.q);
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);

  if (!q || q.length < 2) return res.json({ results: [] });

  // Preferujeme fulltext vyhledavani pres pripraveny search_vector (czech_unaccent).
  // Pokud nevrati nic, fallback na ILIKE prefix matche.
  let { data, error } = await supabase
    .from("listings")
    .select("id, title, locality_city, advert_function, advert_subtype, advert_price")
    .textSearch("search_vector", q, { type: "websearch", config: "czech_unaccent" })
    .limit(limit);

  if (error || !data || data.length === 0) {
    // Fallback — escapujeme % a _ pro bezpecny ILIKE pattern
    const safe = q.replace(/[%_]/g, "\\$&");
    const r2 = await supabase
      .from("listings")
      .select("id, title, locality_city, advert_function, advert_subtype, advert_price")
      .or(`title.ilike.%${safe}%,locality_city.ilike.%${safe}%`)
      .limit(limit);
    if (r2.error) return res.status(500).json({ error: r2.error.message });
    data = r2.data || [];
  }

  res.setHeader("Cache-Control", "public, max-age=30");
  res.json({ results: data });
}
