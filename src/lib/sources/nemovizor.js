// =====================================================================
// Nemovizor data source adapter — STUB / PLACEHOLDER
// =====================================================================
// Aktivuje se kdyz VITE_DATA_SOURCE='nemovizor' nebo 'hybrid'.
//
// Cekame na:
//   1) Nemovizor SDK (`@nemovizor/client` v monorepu)
//   2) Auth method — VITE_NEMOVIZOR_API_KEY nebo OAuth flow
//   3) Mapovani Nemovizor odpovedi -> LogicPro shape (subtype IDs apod.)
//   4) Industrial fieldy — pull z /api/property_extensions (sidecar)
//      a merge s core daty z Nemovizoru.
//
// Pokud nas o Nemovizor specifikaci ulehci, sem doplnime vsechny zdroje
// a feature flag prepne aplikaci automaticky.
// =====================================================================

// Az se napise adapter, doplnit:
//   import { CODEBOOKS } from "../../../lib/codebooks.js";
// eslint-disable-next-line no-unused-vars
const _NEMOVIZOR_BASE = import.meta.env.VITE_NEMOVIZOR_API_URL || "";
// eslint-disable-next-line no-unused-vars
const _NEMOVIZOR_API_KEY = import.meta.env.VITE_NEMOVIZOR_API_KEY || "";

function notReady() {
  return Promise.reject(
    new Error(
      "Nemovizor adapter neni implementovany. Doplnit po doruceni specifikace + SDK."
    )
  );
}

/* eslint-disable no-unused-vars */

export async function searchListings(params) {
  // TODO: Nemovizor SDK `client.searchProperties({ category: 'commercial', ... })`
  // + join s /api/property_extensions na industrial fieldech
  return notReady();
}

export async function getListing(id) {
  // TODO: client.getPropertyBySlug(id) + sidecar fetch property_extensions[id]
  return notReady();
}

export async function getFeatured() {
  // TODO: client.searchProperties({ category: 'commercial', limit: 3, featured: true })
  return notReady();
}

export async function getSimilar(id) {
  // TODO: client.getSimilar(id) nebo searchProperties s podobnymi kriterii
  return notReady();
}

export async function search(q, limit) {
  // TODO: client.aiSearch(q, limit) — Nemovizor ma lepsi search nez nas pg_trgm
  return notReady();
}

export async function getFilterOptions() {
  // TODO: client.getFilterOptions({ category: 'commercial' })
  // + sidecar metadata pro industrial chip filtry (building_class, floor_load atd.)
  return notReady();
}

export async function getMapPoints(bounds) {
  // TODO: client.getMapPoints({ bounds, category: 'commercial' })
  return notReady();
}

/* eslint-enable no-unused-vars */

// ===== Mapping helpers (doplnit po doruceni spec) =====

/**
 * Nemovizor property -> LogicPro listing shape.
 * Sem prijde mapovani jakmile budeme znat Nemovizor response schema.
 */
export function mapNemovizorToLogicPro(_n) {
  // const subtype = NEMOVIZOR_SUBTYPE_TO_LOGICPRO[_n.subtype] || 32;
  // return {
  //   id: _n.id,
  //   title: _n.title,
  //   advert_function: _n.transactionType === 'sale' ? 1 : 2,
  //   advert_subtype: subtype,
  //   ...
  // };
  return null;
}
