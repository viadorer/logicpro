// =====================================================================
// LogicPro data source abstrakce
// =====================================================================
// Cilem je umoznit prepinani mezi:
//   * SUPABASE      — soucasna implementace, primy /api/listings, /api/search atd.
//   * NEMOVIZOR     — Nemovizor SDK + sidecar /api/property_extensions
//   * HYBRID        — read z Nemovizoru, write a industrial fieldy v sidecaru
//
// Prepinani pres env: VITE_DATA_SOURCE ('supabase' | 'nemovizor' | 'hybrid')
// Default: 'supabase' (zachova soucasne chovani).
//
// Vsechny FE moduly volaji `dataSource.searchListings(...)` apod.,
// implementace se vybere podle flagu. Pro testovani lze prepnout
// na hodinu, vratit zpatky bez rollback DB.
// =====================================================================

import * as supabaseSource from "./sources/supabase.js";
// import * as nemovizorSource from "./sources/nemovizor.js";   // TODO az bude SDK

const SOURCE = (import.meta.env.VITE_DATA_SOURCE || "supabase").toLowerCase();

const sources = {
  supabase: supabaseSource,
  // nemovizor: nemovizorSource,
  // hybrid: hybridSource,
};

if (!sources[SOURCE]) {
  console.warn(`[dataSource] Neznamy VITE_DATA_SOURCE='${SOURCE}', padam zpet na 'supabase'`);
}

const active = sources[SOURCE] || supabaseSource;

/**
 * Verejny interface — vsechny FE moduly volaji odsud.
 * Nejmenovat metody podle backend implementace, ale podle business intentu.
 */
export const dataSource = {
  /** Listings stranka s filtry */
  searchListings: (params) => active.searchListings(params),
  /** Detail jedne nemovitosti */
  getListing: (id) => active.getListing(id),
  /** Featured na home */
  getFeatured: () => active.getFeatured(),
  /** Podobne na detailu */
  getSimilar: (id) => active.getSimilar(id),
  /** Fulltext suggester */
  search: (q, limit) => active.search(q, limit),
  /** Filter chips s pocty */
  getFilterOptions: () => active.getFilterOptions(),
  /** Mapove body */
  getMapPoints: (bounds) => active.getMapPoints?.(bounds) ?? Promise.resolve([]),
  /** Aktivni source — pro debug/UI badge */
  name: SOURCE,
};
