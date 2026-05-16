import { requireSupabase } from "./../lib/supabase.js";

const SUBTYPE_LABELS = {
  25: "Kanceláře", 26: "Sklady", 27: "Výroba", 28: "Obchodní prostory",
  29: "Ubytování", 30: "Restaurace", 31: "Zemědělský", 32: "Ostatní",
  38: "Činžovní dům", 49: "Virtuální kancelář",
  50: "Logistika", 51: "Retail park", 52: "Datacentrum",
  53: "Coworking", 54: "Polyfunkční", 55: "Garáže / Parking",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = requireSupabase(res);
  if (!supabase) return;

  const [cityRes, subtypeRes] = await Promise.all([
    supabase.rpc("get_city_counts"),
    supabase.rpc("get_subtype_counts"),
  ]);

  if (cityRes.error || subtypeRes.error) {
    return res.status(500).json({ error: (cityRes.error || subtypeRes.error).message });
  }

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.json({
    cities: cityRes.data,
    subtypes: (subtypeRes.data || []).map((s) => ({
      ...s,
      label: SUBTYPE_LABELS[s.value] || "Neuvedeno",
    })),
  });
}
