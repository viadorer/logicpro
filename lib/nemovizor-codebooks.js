// =====================================================================
// Mapování mezi LogicPro integer codebooky (Sreality-style) a Nemovizor
// string slugy. Používá se v /api/* handlerech při proxování do Nemovizoru.
// =====================================================================

// ─── listing_type (Prodej / Pronájem / …) ─────────────────────────────────
export const LISTING_TYPE_TO_NEMOVIZOR = {
  1: "sale",
  2: "rent",
};
export const LISTING_TYPE_FROM_NEMOVIZOR = {
  sale: 1,
  rent: 2,
  // Pro UI mapujeme zbytek na "sale" (LogicPro nemá auction/project/shares pro komerční)
  auction: 1,
  project: 1,
  shares: 1,
};

// ─── currency ────────────────────────────────────────────────────────────
export const CURRENCY_TO_NEMOVIZOR = {
  1: "czk",
  2: "usd",
  3: "eur",
};
export const CURRENCY_FROM_NEMOVIZOR = {
  czk: 1,
  CZK: 1,
  usd: 2,
  USD: 2,
  eur: 3,
  EUR: 3,
};

// ─── price unit ──────────────────────────────────────────────────────────
export const PRICE_UNIT_TO_NEMOVIZOR = {
  1: "za nemovitost",
  2: "za měsíc",
  3: "za m²",
  4: "za m²/měs.",
  5: "za m²/rok",
  6: "za rok",
};
export const PRICE_UNIT_FROM_NEMOVIZOR = Object.fromEntries(
  Object.entries(PRICE_UNIT_TO_NEMOVIZOR).map(([k, v]) => [v, Number(k)])
);

// ─── subtypes (LogicPro int → Nemovizor slug) ───────────────────────────
//
// LogicPro má 6 granular kategorií (Logistika, Retail park, Datacentrum,
// Coworking, Polyfunkční, Garáže), které Nemovizor nezná. Mapujeme je
// na nejbližší Nemovizor subtype A v sidecaru držíme `sub_type_local`
// pro přesný filter v UI.
//
export const SUBTYPE_TO_NEMOVIZOR = {
  25: "kancelare",
  26: "sklady",
  27: "vyroba",
  28: "obchodni_prostory",
  29: "ubytovani",
  30: "restaurace",
  31: "zemedelsky",
  32: "ostatni",
  38: "cinzovni_dum",
  49: "virtualni_kancelar",
  // Aggregate fallbacks (granular je v sidecar.sub_type_local)
  50: "sklady", // Logistika
  51: "obchodni_prostory", // Retail park
  52: "kancelare", // Datacentrum
  53: "kancelare", // Coworking
  54: "ostatni", // Polyfunkční
  55: "ostatni", // Garáže / Parking
};

export const SUBTYPE_FROM_NEMOVIZOR = {
  kancelare: 25,
  sklady: 26,
  vyroba: 27,
  obchodni_prostory: 28,
  ubytovani: 29,
  restaurace: 30,
  zemedelsky: 31,
  ostatni: 32,
  cinzovni_dum: 38,
  virtualni_kancelar: 49,
};

// Granular LogicPro-specific subtypy uložené v sidecaru
export const SUB_TYPE_LOCAL_TO_LEGACY = {
  logistika: 50,
  retail_park: 51,
  datacentrum: 52,
  coworking: 53,
  polyfunkcni: 54,
  garaze: 55,
};
export const LEGACY_TO_SUB_TYPE_LOCAL = Object.fromEntries(
  Object.entries(SUB_TYPE_LOCAL_TO_LEGACY).map(([k, v]) => [v, k])
);

export const SUB_TYPE_LOCAL_LABELS = {
  logistika: "Logistika",
  retail_park: "Retail park",
  datacentrum: "Datacentrum",
  coworking: "Coworking",
  polyfunkcni: "Polyfunkční",
  garaze: "Garáže / Parking",
};

// Listy z `lib/codebooks.js` jsou source-of-truth pro UI labely
// (Kanceláře, Sklady, …). Tady jen mapujeme klíče mezi ID prostory.

// ─── Property: Nemovizor camelCase → LogicPro snake_case ─────────────────
//
// Sidecar (property_extensions z migrace 4) drží:
//   - industrial fieldy (autoritativní)
//   - hot mirror core poli z Nemovizoru (denormalizace pro filter)
//
// Zde mergujeme Nemovizor property + sidecar row → LogicPro listing shape.
export function toLogicProShape(nemovizorProperty, sidecar = null) {
  const p = nemovizorProperty;
  if (!p) return null;

  // Pokud máme sidecar a má sub_type_local, použijeme legacy int kód
  // (50-55); jinak mapujeme Nemovizor subtype.
  const subtypeInt = sidecar?.sub_type_local
    ? SUB_TYPE_LOCAL_TO_LEGACY[sidecar.sub_type_local] ?? 32
    : SUBTYPE_FROM_NEMOVIZOR[p.subtype] ?? 32;

  return {
    // ── Identifikace ────────────────────────────────────────────────────
    nemovizor_id: p.id,
    slug: p.slug,
    // Legacy int id (pro 301 redirect ze starých URL) — z hot mirror sidecaru
    id: sidecar?.legacy_logicpro_id ?? null,

    // ── Základní ────────────────────────────────────────────────────────
    title: p.title,
    advert_function: LISTING_TYPE_FROM_NEMOVIZOR[p.listingType] ?? 1,
    advert_subtype: subtypeInt,
    sub_type_local: sidecar?.sub_type_local ?? null,
    status: sidecar?.mirror_status || (p.active ? "active" : "archived"),

    // ── Cena ────────────────────────────────────────────────────────────
    advert_price: p.price,
    advert_price_currency: CURRENCY_FROM_NEMOVIZOR[p.priceCurrency?.toLowerCase?.()] ?? 1,
    advert_price_unit: PRICE_UNIT_FROM_NEMOVIZOR[p.priceUnit] ?? 1,
    advert_price_note: p.priceNote ?? null,

    // ── Lokace ──────────────────────────────────────────────────────────
    locality_city: p.city,
    locality_citypart: p.cityPart,
    locality_region: p.region,
    locality_street: p.street,
    locality_zip: p.zip,
    locality_latitude: p.latitude,
    locality_longitude: p.longitude,

    // ── Plocha ─────────────────────────────────────────────────────────
    usable_area: p.area,
    estate_area: p.landArea,
    office_area: p.officesArea ?? sidecar?.office_area ?? null,
    production_area: p.productionArea ?? sidecar?.production_area ?? null,
    shop_area: p.shopArea ?? sidecar?.shop_area ?? null,
    store_area: p.storeArea ?? sidecar?.store_area ?? null,
    workshop_area: p.workshopArea ?? sidecar?.workshop_area ?? null,
    min_divisible_area: sidecar?.min_divisible_area ?? null,

    // ── Stav budovy ────────────────────────────────────────────────────
    year_built: p.yearBuilt,
    year_renovated: p.lastRenovation,
    ceiling_height: p.ceilingHeight ?? sidecar?.ceiling_height ?? null,

    // ── Industrial fieldy (sidecar autoritativní) ──────────────────────
    building_class: sidecar?.building_class ?? null,
    certification: sidecar?.certification ?? null,
    floor_load: sidecar?.floor_load ?? null,
    loading_docks: sidecar?.loading_docks ?? null,
    dock_type: sidecar?.dock_type ?? null,
    drive_in_gates: sidecar?.drive_in_gates ?? null,
    crane_capacity: sidecar?.crane_capacity ?? null,
    column_grid: sidecar?.column_grid ?? null,
    sprinkler_type: sidecar?.sprinkler_type ?? null,
    rail_access: sidecar?.rail_access ?? false,
    highway_distance: sidecar?.highway_distance ?? null,
    lease_type: sidecar?.lease_type ?? null,

    // ── Popis ──────────────────────────────────────────────────────────
    summary: p.summary,
    description: p.description,

    // ── Obrázky ────────────────────────────────────────────────────────
    listing_images: (p.images ?? []).map((url, i) => ({
      url,
      is_main: i === 0,
      sort_order: i,
      alt: p.title,
    })),

    // ── Makléř (pokud Nemovizor vrací — některé endpointy strippují PII) ──
    broker_name: p.brokerName ?? null,
    broker_phone: p.brokerPhone ?? null,
    broker_email: p.brokerEmail ?? null,
    agency_name: p.agencyName ?? null,

    // ── Meta ───────────────────────────────────────────────────────────
    featured: p.featured ?? false,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}
