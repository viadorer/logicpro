import { requireSupabase } from "./../lib/supabase.js";
import { getDataSource } from "./../lib/data-source.js";
import { nemovizor, NemovizorError } from "./../lib/nemovizor.js";
import { SUBTYPE_FROM_NEMOVIZOR } from "./../lib/nemovizor-codebooks.js";

const SUBTYPE_LABELS = {
  25: "Kanceláře", 26: "Sklady", 27: "Výroba", 28: "Obchodní prostory",
  29: "Ubytování", 30: "Restaurace", 31: "Zemědělský", 32: "Ostatní",
  38: "Činžovní dům", 49: "Virtuální kancelář",
  50: "Logistika", 51: "Retail park", 52: "Datacentrum",
  53: "Coworking", 54: "Polyfunkční", 55: "Garáže / Parking",
};

// ─── Nemovizor variant ────────────────────────────────────────────────────
async function handlerNemovizor(req, res) {
  try {
    const f = await nemovizor.getFilterOptions({ category: "commercial" });
    const data = f.data ?? f;

    // Nemovizor cities format: typicky [{ value: "Praha", count: N }] nebo string[].
    // Normalizuj na { name, count }.
    const cities = (data.cities || []).map((c) =>
      typeof c === "string" ? { name: c, count: null } : { name: c.value ?? c.name, count: c.count }
    );

    // Subtypes: Nemovizor vraci [{ value: "kancelare", count: N }]
    // → mapuj zpet na LogicPro int kód a doplň label.
    const subtypes = (data.subtypes || [])
      .map((s) => {
        const slug = typeof s === "string" ? s : s.value;
        const intCode = SUBTYPE_FROM_NEMOVIZOR[slug];
        if (!intCode) return null;
        return {
          value: intCode,
          count: typeof s === "object" ? s.count : null,
          label: SUBTYPE_LABELS[intCode],
        };
      })
      .filter(Boolean);

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.setHeader("X-Data-Source", "nemovizor");
    return res.json({
      cities,
      subtypes,
      priceRange: data.priceRange ?? null,
      areaRange: data.areaRange ?? null,
    });
  } catch (err) {
    if (err instanceof NemovizorError) {
      console.warn("[filters] Nemovizor failed:", err.status);
      return res.status(502).json({ error: "Upstream API unavailable" });
    }
    throw err;
  }
}

// ─── Original Supabase variant ────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (getDataSource() === "nemovizor") {
    return handlerNemovizor(req, res);
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
