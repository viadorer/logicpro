// Supabase / native LogicPro data source adapter.
// Wrappuje existujici /api/* endpointy do business interface
// definovaneho v `../dataSource.js`.

const BASE = "/api";

async function fetchJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function qs(params = {}) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.set(k, v);
  }
  const s = u.toString();
  return s ? "?" + s : "";
}

export async function searchListings(params = {}) {
  const data = await fetchJSON(`/listings${qs(params)}`);
  return {
    total: data.total || 0,
    items: data.listings || [],
    limit: data.limit,
    offset: data.offset,
  };
}

export async function getListing(id) {
  return fetchJSON(`/listings/${encodeURIComponent(id)}`);
}

export async function getFeatured() {
  const data = await fetchJSON("/listings/featured");
  return data.listings || [];
}

export async function getSimilar(id) {
  const data = await fetchJSON(`/listings/${encodeURIComponent(id)}/similar`);
  return data.listings || [];
}

export async function search(q, limit = 8) {
  const data = await fetchJSON(`/search${qs({ q, limit })}`);
  return data.results || [];
}

export async function getFilterOptions() {
  return fetchJSON("/filters");
}

export async function getMapPoints(_bounds) {
  // Native implementace nema dedikovany endpoint — tahá vse pres /listings
  // a klient si vyfiltruje. Pro Nemovizor SDK je dedikovany endpoint.
  const data = await fetchJSON(`/listings${qs({ limit: 100 })}`);
  return (data.listings || []).map((l) => ({
    id: l.id,
    latitude: l.locality_latitude,
    longitude: l.locality_longitude,
    title: l.title,
    price: l.advert_price,
  })).filter((p) => p.latitude && p.longitude);
}
