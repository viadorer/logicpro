const BASE = "/api";

async function fetchJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export function fetchListings(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  }
  const q = qs.toString();
  return fetchJSON(`/listings${q ? "?" + q : ""}`);
}

export function fetchFeatured() {
  return fetchJSON("/listings/featured");
}

export function fetchDetail(id) {
  return fetchJSON(`/listings/${id}`);
}

export function fetchSimilar(id) {
  return fetchJSON(`/listings/${id}/similar`);
}

export function fetchCodebooks() {
  return fetchJSON("/codebooks");
}

export function fetchFilters() {
  return fetchJSON("/filters");
}

export function fetchSearch(query, limit = 8) {
  return fetchJSON(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}
