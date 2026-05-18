// =====================================================================
// Nemovizor API klient — server-side only (Vercel serverless functions).
// =====================================================================
// Drží API klíč v server-side env (NEMOVIZOR_API_KEY, BEZ VITE_ prefixu),
// takže ho klient nikdy nevidí. Volá `https://www.nemovizor.cz/api/v1/*`
// (bare doména přesměrovává).
//
// Po publikování @viadorer/nemovizor-sdk se tento soubor nahradí
// importem balíčku — všechny ostatní soubory zůstávají beze změny.
// =====================================================================

const BASE = (process.env.NEMOVIZOR_API_URL || process.env.NEMOVIZOR_API_BASE || "https://www.nemovizor.cz").replace(/\/$/, "");
const API_KEY = process.env.NEMOVIZOR_API_KEY || "";
const TIMEOUT_MS = Number(process.env.NEMOVIZOR_TIMEOUT_MS || 10_000);

export class NemovizorError extends Error {
  constructor(status, body, message) {
    super(message);
    this.name = "NemovizorError";
    this.status = status;
    this.body = body;
  }
}

async function request(method, path, { query, body, signal } = {}) {
  const url = new URL(BASE + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      if (Array.isArray(v)) url.searchParams.set(k, v.join(","));
      else url.searchParams.set(k, String(v));
    }
  }

  const headers = { Accept: "application/json" };
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const combinedSignal = signal
    ? AbortSignal.any?.([ctrl.signal, signal]) ?? ctrl.signal
    : ctrl.signal;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new NemovizorError(0, null, `Nemovizor ${method} ${path} timeout after ${TIMEOUT_MS}ms`);
    }
    throw new NemovizorError(0, null, `Nemovizor ${method} ${path} network error: ${err.message}`);
  }
  clearTimeout(timer);

  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new NemovizorError(res.status, parsed, `Nemovizor ${method} ${path} → ${res.status}`);
  }
  return parsed;
}

// ─── Public API ───────────────────────────────────────────────────────────

export const nemovizor = {
  /** GET /api/v1/properties */
  searchProperties: (query) => request("GET", "/api/v1/properties", { query }),

  /** GET /api/v1/properties/{uuid} */
  getProperty: (uuid) => request("GET", `/api/v1/properties/${uuid}`),

  /** GET /api/v1/properties/by-slug/{slug} */
  getPropertyBySlug: (slug) =>
    request("GET", `/api/v1/properties/by-slug/${encodeURIComponent(slug)}`),

  /** GET /api/v1/properties/{uuid}/similar */
  getSimilar: (uuid) => request("GET", `/api/v1/properties/${uuid}/similar`),

  /** GET /api/v1/map-points */
  getMapPoints: (query) => request("GET", "/api/v1/map-points", { query }),

  /** GET /api/v1/filter-options */
  getFilterOptions: (query) => request("GET", "/api/v1/filter-options", { query }),

  /** POST /api/ai-search */
  aiSearch: (body) => request("POST", "/api/ai-search", { body }),

  /** POST /api/leads */
  createLead: (body) => request("POST", "/api/leads", { body }),

  /** POST /api/valuation/estimate */
  estimateValuation: (body) => request("POST", "/api/valuation/estimate", { body }),

  /** GET /api/v1/brokers/{uuid}/contact */
  getBrokerContact: (uuid) => request("GET", `/api/v1/brokers/${uuid}/contact`),

  // Raw escape hatch (např. pro migrační skript, který volá Import API)
  request,
};
