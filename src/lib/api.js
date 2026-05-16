// =====================================================================
// LogicPro FE API wrapper — DEPRECATED, zachovany pro zpetnou kompatibilitu.
// =====================================================================
// Nova abstrakce je v `./dataSource.js`. Tento soubor jen forwarduje
// pro stavajici call sites, ktere zatim nebyly migrovany.
//
// Migrace plan:
//   1. Komponenty postupne presunout na import { dataSource } from './dataSource';
//   2. Zde zachovat aliasy, dokud zbyvaji call sites.
//   3. Po finalni migraci tento soubor smazat.
// =====================================================================

import { dataSource } from "./dataSource";

export function fetchListings(params = {}) {
  // dataSource.searchListings vrati { total, items, limit, offset }
  // Stara API vracelo { total, listings }. Mapujeme zpet.
  return dataSource.searchListings(params).then((r) => ({
    total: r.total,
    listings: r.items,
    limit: r.limit,
    offset: r.offset,
  }));
}

export function fetchFeatured() {
  return dataSource.getFeatured().then((items) => ({ listings: items }));
}

export function fetchDetail(id) {
  return dataSource.getListing(id);
}

export function fetchSimilar(id) {
  return dataSource.getSimilar(id).then((items) => ({ listings: items }));
}

export function fetchCodebooks() {
  // Codebooks endpoint je staticky, nepotrebuje data source layer
  return fetch("/api/codebooks").then((r) => r.json());
}

export function fetchFilters() {
  return dataSource.getFilterOptions();
}

export function fetchSearch(query, limit = 8) {
  return dataSource.search(query, limit).then((results) => ({ results }));
}
