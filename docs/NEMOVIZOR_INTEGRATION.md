# LogicPro × Nemovizor API — kompletní integrační návod

> **Stav:** Návrh + ready-to-paste implementace. Datum: 2026-05-16.
> **Účel:** Nahradit Supabase `listings` jako zdroj dat v LogicPro daty z [Nemovizor API](https://www.nemovizor.cz/api/openapi). Auth, sidecar pro industrial fieldy a admin write path zůstávají na Supabase.

---

## Obsah

1. [Cíl a high-level architektura](#1-cíl-a-high-level-architektura)
2. [Předpoklady (API klíč, env vars)](#2-předpoklady)
3. [Tok dat a vrstvy](#3-tok-dat-a-vrstvy)
4. [Mapování endpointů LogicPro → Nemovizor](#4-mapování-endpointů)
5. [Mapování datového modelu a codebooků](#5-mapování-datového-modelu)
6. [Sidecar Supabase tabulka pro industrial fieldy](#6-sidecar-supabase-tabulka)
7. [Sdílený klient `lib/nemovizor.js` (kompletní kód)](#7-sdílený-klient-libnemovizorjs)
8. [Per-endpoint reimplementace (kompletní kód)](#8-per-endpoint-reimplementace)
9. [Frontend změny (`src/lib/api.js`, codebooks)](#9-frontend-změny)
10. [Auth & admin write path](#10-auth--admin-write-path)
11. [Migrace existujících listings](#11-migrace-existujících-listings)
12. [Cache & rate limity](#12-cache--rate-limity)
13. [Error handling & UX](#13-error-handling--ux)
14. [Lokální vývoj](#14-lokální-vývoj)
15. [Testing](#15-testing)
16. [Cutover plan (fázový rollout)](#16-cutover-plan)
17. [Deployment checklist](#17-deployment-checklist)
18. [Příloha A: kompletní subtype mapping](#příloha-a-subtype-mapping)
19. [Příloha B: troubleshooting](#příloha-b-troubleshooting)

---

## 1. Cíl a high-level architektura

**Dnes:** LogicPro čte listingy ze Supabase tabulky `listings` (vč. industrial-specific polí jako `building_class`, `floor_load`, `ceiling_height`, `certification`). Listingy se editují přes `/admin`.

**Cílový stav:**

```
┌──────────────────┐     ┌────────────────────┐     ┌─────────────────────────┐
│  React SPA       │ ──→ │ Vercel API proxy   │ ──→ │ Nemovizor API           │
│  (Vite)          │     │ (api/*.js)         │     │ www.nemovizor.cz/api/v1 │
└──────────────────┘     │  + Cache           │     └─────────────────────────┘
                         │  + Codebook mapping│
                         │  + Industrial JOIN ←──→ Supabase: commercial_extensions
                         └────────────────────┘     (sidecar — jen industrial fieldy)
                                  ↑
                                  └─ Supabase Auth (uživatelé, oblíbené, profil)
                                  └─ Supabase: inquiries (kontaktní formuláře — viz §10)
```

**Klíčová rozhodnutí:**

| Co | Volba | Důvod |
|---|---|---|
| Zdroj listing dat | **Nemovizor API** | Single source of truth napříč Nemovize, ČeskoSobě, LogicPro |
| Auth a oblíbené | **Supabase Auth** (zůstává) | LogicPro-specific uživatelská data, Nemovizor je řeší jinak |
| Industrial fieldy (floor_load, dock_type, …) | **Sidecar Supabase tabulka** `commercial_extensions` | Nemovizor je nemá; přidávat je tam je velký commit |
| Admin write path | **Read-only v1**, později přes Nemovizor Import API | LogicPro nemá agency API key se `write:import` scope |
| Vercel API jako proxy | **Ano** | API klíč zůstává na serveru, máme prostor na cache + codebook mapping |
| LogicPro `id` (number) ↔ Nemovizor `id` (UUID) | **slug-based routing** | Změníme detail URL z `/detail/:id` na `/detail/:slug`. UUID vs int konflikt eliminován |

---

## 2. Předpoklady

### 2.1 Nemovizor API klíč

Pro většinu read endpointů anonymní volání stačí (rate limit per IP). API klíč zvyšuje rate limit a odemyká privilegované endpointy (`/leads` s vyšším limitem, future webhooks, broker contact bez per-IP omezení).

**Získání:**
1. Přihlas se do nemovizor.cz pod účtem s rolí `broker` nebo `agency`
2. Jdi na `/broker/api-keys`
3. Klikni **"Vytvořit nový klíč"** → název: `logicpro-prod`, scopes: `read:public` (defaultní); pro write Inquiries: žádný extra scope, `/leads` je veřejné
4. Zkopíruj klíč **hned** (zobrazí se jen jednou)

**Také vygeneruj `logicpro-dev`** pro lokální vývoj (samostatný klíč → samostatný rate-limit bucket).

### 2.2 Env vars

Přidat do **Vercel → Project → Settings → Environment Variables**:

| Variable | Production | Preview | Development | Hodnota |
|---|---|---|---|---|
| `NEMOVIZOR_API_BASE` | ✅ | ✅ | ✅ | `https://www.nemovizor.cz` |
| `NEMOVIZOR_API_KEY` | ✅ | ✅ | ❌ | (production klíč) |
| `NEMOVIZOR_API_KEY_DEV` | ❌ | ❌ | ✅ | (dev klíč nebo prázdné = anonymous) |
| `NEMOVIZOR_TIMEOUT_MS` | ✅ | ✅ | ✅ | `10000` |

Lokálně v `.env.local`:

```bash
NEMOVIZOR_API_BASE=https://www.nemovizor.cz
NEMOVIZOR_API_KEY=nv_dev_xxxxxxxxxxxxxxxx
NEMOVIZOR_TIMEOUT_MS=10000

# Pro vývoj proti lokálnímu nemovizor-mvp:
# NEMOVIZOR_API_BASE=http://localhost:3000
```

> ⚠️ **Nikdy nedávej API klíč do `VITE_*` env var** — to by ho exposlo do client bundlu. Klient nikdy přímo nevolá Nemovizor; vždy přes `/api/*` proxy.

### 2.3 Závislosti

Žádné nové npm balíčky nepotřebuješ — vše stačí s `fetch` (Node 20+ má built-in).

---

## 3. Tok dat a vrstvy

### 3.1 Pravidla

1. **Frontend (React) nikdy nevolá Nemovizor přímo.** Vždy přes vlastní `/api/*` na Vercelu.
2. **Vercel API proxy** dělá tři věci: skryje API klíč, **mapuje codebooky** (LogicPro integer kód ↔ Nemovizor string slug), **mergduje sidecar data** (industrial fieldy ze Supabase).
3. **Supabase** zůstává pro: Auth, oblíbené, uložená hledání, inquiries (uložení po odeslání), sidecar industrial fieldy.
4. **Cachování** na úrovni Vercel CDN + Nemovizor (oba mají `Cache-Control` headery).

### 3.2 Sekvence pro listing detail (příklad)

```
Browser                Vercel /api/listings/:slug             Nemovizor                Supabase
   │                          │                                   │                       │
   │ GET /api/listings/x      │                                   │                       │
   ├─────────────────────────→│                                   │                       │
   │                          │ GET /api/v1/properties/by-slug/x  │                       │
   │                          ├──────────────────────────────────→│                       │
   │                          │←─── property (camelCase, no PII) ─┤                       │
   │                          │                                                           │
   │                          │ SELECT * FROM commercial_extensions WHERE                 │
   │                          │   nemovizor_id = property.id                              │
   │                          ├──────────────────────────────────────────────────────────→│
   │                          │←──── industrial fields (or null) ─────────────────────────┤
   │                          │                                                           │
   │ ←─── merged LogicPro     │                                                           │
   │     shape (legacy keys)  │                                                           │
```

---

## 4. Mapování endpointů

| LogicPro (zůstává) | Metoda | Nemovizor target | Poznámka |
|---|---|---|---|
| `/api/listings` | GET | `GET /api/v1/properties?category=commercial&...` | Hard-coded `category=commercial`. Mapuj LogicPro `advert_subtype` (int) → Nemovizor `subtype` (string). |
| `/api/listings/featured` | GET | `GET /api/v1/properties?category=commercial&sort=newest&limit=3` | Místo Supabase flag-based `featured` zatím použít nejnovější. *(Nemovizor zatím nemá per-broker featured pro komerční.)* |
| `/api/listings/[id]` | GET | `GET /api/v1/properties/by-slug/{slug}` | **BREAKING UI změna**: routing musí používat slug, ne int id. Viz §5.4. |
| `/api/listings/[id]/similar` | GET | `GET /api/v1/properties/{uuid}/similar` | Endpoint existuje, ale očekává UUID — proto interně resolvneme `slug → uuid` nebo cachneme uuid v response. |
| `/api/codebooks` | GET | (lokální, žádný call) | Zůstává jak je. LogicPro UI číselníky se nemění. |
| `/api/filters` | GET | `GET /api/v1/filter-options?category=commercial` | Nemovizor vrací subtypes/cities/ranges. Mapuj zpět na LogicPro int kódy. |
| `/api/search?q=...` | GET | `POST /api/ai-search` (tier 1) | Místo Supabase fulltext → Nemovizor AI-search. Vrátí strukturované filtry → my je sami aplikujeme přes `/api/v1/properties`. |
| `/api/inquiries` | POST | `POST /api/leads` | Lead jde do Nemovizoru. Současně zrcadlíme do Supabase `inquiries` pro LogicPro reporting. |
| `/api/cron/*` | — | — | Nemění. |
| **(nový)** `/api/valuation` | POST | `POST /api/valuation/estimate` | Volitelné — komerční odhad. *(NICE-TO-HAVE, nepoužívat dokud Nemovizor nedoladí komerční model.)* |

---

## 5. Mapování datového modelu

### 5.1 Property: LogicPro field ↔ Nemovizor field

Nemovizor vrací **camelCase** na `/api/v1/*`. LogicPro UI očekává Supabase-style **snake_case**. Mapování:

| LogicPro (Supabase) | Nemovizor `/api/v1/properties` | Komentář |
|---|---|---|
| `id` (int8) | (žádné — používáme **`slug`** + `uuid`) | LogicPro int IDs zmizí. Pokud potřebuješ stabilní int pro analytics, hash slug → int. |
| `title` | `title` | 1:1 |
| `advert_function` (1=sale, 2=rent) | `listingType` ("sale"/"rent") | Codebook map (§5.3) |
| `advert_subtype` (25-55) | `subtype` (slug, např. "kancelare") | Codebook map (§5.3). **Pozor na chybějící: 50 Logistika, 51 Retail park, 52 Datacentrum, 53 Coworking, 54 Polyfunkční, 55 Garáže.** Viz §5.5. |
| `advert_price` (number) | `price` | 1:1 |
| `advert_price_currency` (1=CZK,2=USD,3=EUR) | `priceCurrency` ("czk"/"usd"/"eur") | Map |
| `advert_price_unit` | `priceUnit` | Map (string) |
| `locality_city` | `city` | 1:1 |
| `locality_citypart` | `cityPart` | 1:1 |
| `locality_region` | `region` | 1:1 |
| `locality_latitude` | `latitude` | 1:1 |
| `locality_longitude` | `longitude` | 1:1 |
| `usable_area` | `area` | 1:1 (užitná) |
| `estate_area` | `landArea` | Pozemek |
| `office_area` | `officesArea` | 1:1 |
| `building_class` (1/2/3 → A/B/C) | ❌ **Sidecar** | Není v Nemovizoru. Viz §6. |
| `certification` (1-12 → BREEAM/LEED/DGNB) | 🟡 **Sidecar** (Nemovizor má `certifications[]` na Import, ne na Property output) | Viz §6. |
| `ceiling_height` | `ceilingHeight` | 1:1 |
| `floor_load` | ❌ **Sidecar** | Není. |
| `loading_docks` | ❌ **Sidecar** | Není. |
| `dock_type` | ❌ **Sidecar** | Není. |
| `crane_capacity` | ❌ **Sidecar** | Není. |
| `column_grid` | ❌ **Sidecar** | Není. |
| `sprinkler_type` | ❌ **Sidecar** | Není. |
| `rail_access` | ❌ **Sidecar** | Není. |
| `highway_distance` | ❌ **Sidecar** | Není. |
| `year_built` | `yearBuilt` | 1:1 |
| `year_renovated` | `lastRenovation` | 1:1 |
| `lease_type` (NNN/NN/Gross/Modified) | `leaseType` (Nemovizor enum) | Map — Nemovizor enum hodnoty si nech verifikovat z `/api/openapi`. |
| `parking_type` | `parking` (string) | 1:1 (Nemovizor je multistring) |
| `description` | `description` | 1:1 |
| `images` (Supabase Storage URL) | `images[]` (Nemovizor R2 URLs) | URLs jsou jiné domény, frontend musí mít CSP / next/image config povolen. |

### 5.2 Felt missing: `created_at`, `updated_at`

Nemovizor vrací `createdAt`, `updatedAt`. Pokud LogicPro řadí podle `created_at`, mapuj na `createdAt`.

### 5.3 Codebook mapping (LogicPro int ↔ Nemovizor string)

Vytvoř nový soubor **`lib/nemovizor-codebooks.js`** (server-side, soused `lib/codebooks.js`):

```js
// lib/nemovizor-codebooks.js
//
// Bidirectional maps between LogicPro integer codebooks (Sreality-style)
// and Nemovizor string slugs. Used in /api/* proxy handlers.

export const LISTING_TYPE_TO_NEMOVIZOR = {
  1: "sale",
  2: "rent",
};

export const LISTING_TYPE_FROM_NEMOVIZOR = {
  sale: 1,
  rent: 2,
  auction: 1, // map auction → "sale" pro UI; nebo přidat 3 do UI
  project: 1,
  shares: 1,
};

export const CURRENCY_TO_NEMOVIZOR = {
  1: "czk",
  2: "usd",
  3: "eur",
};
export const CURRENCY_FROM_NEMOVIZOR = {
  czk: 1, CZK: 1,
  usd: 2, USD: 2,
  eur: 3, EUR: 3,
};

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

// Klíčové: LogicPro int → Nemovizor slug
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

  // ⚠️ LogicPro-specific, Nemovizor je nezná → mapujeme na nejbližší
  50: "sklady",            // Logistika    → fallback sklady, doplň ve sidecaru sub_type_local: "logistika"
  51: "obchodni_prostory", // Retail park  → fallback obchodní, sidecar: "retail_park"
  52: "kancelare",         // Datacentrum  → fallback kanceláře, sidecar: "datacentrum"
  53: "kancelare",         // Coworking    → fallback kanceláře, sidecar: "coworking"
  54: "ostatni",           // Polyfunkční  → fallback ostatní, sidecar: "polyfunkcni"
  55: "ostatni",           // Garáže       → fallback ostatní, sidecar: "garaze"
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

// Granular kategorie — sidecar.sub_type_local → UI display
export const SUBTYPE_LOCAL_LABELS = {
  logistika: "Logistika",
  retail_park: "Retail park",
  datacentrum: "Datacentrum",
  coworking: "Coworking",
  polyfunkcni: "Polyfunkční",
  garaze: "Garáže / Parking",
};
```

### 5.4 ID problém: int8 vs UUID

LogicPro frontend dnes routuje na `/detail/:id` (int). Nemovizor používá UUID + slug. **Doporučené řešení**:

- Změnit routing na `/detail/:slug`
- V `App.jsx` / `routes.jsx`: `<Route path="/detail/:slug" element={<Detail />} />`
- V Detail.jsx: `const { slug } = useParams();` místo `id`
- API call `fetchDetail(slug)` → `GET /api/listings/{slug}` → proxy do `GET /api/v1/properties/by-slug/{slug}`

**Důsledek pro existující URL** (např. v Google indexu): potřebuješ 301 redirect z `/detail/:id` → `/detail/:slug`. Buď přes Vercel `vercel.json` redirect (pokud máš mapping starých int IDs → slugs v sidecar tabulce — viz §6), nebo přes catch-all route v React Router který zobrazí "Tato nabídka byla přesunuta" + odkaz na hlavní seznam.

### 5.5 Granular subtypes mimo Nemovizor

LogicPro UI nabízí 6 kategorií, které Nemovizor nezná: Logistika, Retail park, Datacentrum, Coworking, Polyfunkční, Garáže.

**Řešení**: V sidecar tabulce `commercial_extensions` máme sloupec `sub_type_local`. UI filtr v LogicPro pošle do `/api/listings` parametr `advert_subtype=50` (Logistika). Náš proxy:

1. Volá Nemovizor s `subtype=sklady` (mapování `50 → sklady`)
2. **Plus** JOINem omezí výsledky na ty, kde `commercial_extensions.sub_type_local = "logistika"`

To znamená, že tyto granular kategorie fungují **jen pro listingy, které mají sidecar zápis**. Stará data importovaná do Nemovizoru bez sidecaru se v "Logistika" filtru neobjeví. To je OK pro v1; postupně doplníš sidecar pro klíčové listingy.

---

## 6. Sidecar Supabase tabulka

### 6.1 Schéma

```sql
-- supabase/migrations/2026XXXXXXX_commercial_extensions.sql

create table public.commercial_extensions (
  nemovizor_id        uuid primary key,                  -- FK na property v Nemovizoru
  nemovizor_slug      text not null,                     -- redundantní, pro rychlé lookup
  legacy_logicpro_id  bigint unique,                     -- jen pro migraci & 301 redirect
  sub_type_local      text,                              -- "logistika"|"retail_park"|"datacentrum"|"coworking"|"polyfunkcni"|"garaze"
  building_class      smallint check (building_class in (1,2,3)),
  certification       smallint check (certification between 1 and 12),
  floor_load          numeric(8,2),                      -- kg/m²
  loading_docks       smallint,
  dock_type           text,                              -- "level"|"dock"|"both"
  crane_capacity      numeric(8,2),                      -- tun
  column_grid         text,                              -- "8x8"|"12x12"|...
  sprinkler_type      text,                              -- "wet"|"dry"|"esfr"|"none"
  rail_access         boolean default false,
  highway_distance    numeric(6,2),                      -- km
  min_divisible_area  numeric(10,2),                     -- m²
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index commercial_extensions_slug_idx on public.commercial_extensions(nemovizor_slug);
create index commercial_extensions_subtype_idx on public.commercial_extensions(sub_type_local);

-- RLS — zápis jen z service role (admin), čtení veřejné
alter table public.commercial_extensions enable row level security;
create policy "public_read" on public.commercial_extensions for select using (true);

-- Trigger pro updated_at
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger commercial_extensions_updated_at
  before update on public.commercial_extensions
  for each row execute function update_updated_at();
```

### 6.2 Helper pro batch lookup

```js
// lib/sidecar.js
import { requireSupabase } from "./supabase.js";

/**
 * Načte sidecar industrial data pro pole property IDs (UUIDs).
 * Vrací map { uuid → sidecar row }.
 */
export async function fetchSidecarBatch(res, ids) {
  if (!ids?.length) return new Map();
  const supabase = requireSupabase(res);
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from("commercial_extensions")
    .select("*")
    .in("nemovizor_id", ids);

  if (error) {
    console.warn("[sidecar] fetch failed:", error.message);
    return new Map();
  }
  return new Map(data.map((row) => [row.nemovizor_id, row]));
}

export async function fetchSidecarOne(res, nemovizorId) {
  const m = await fetchSidecarBatch(res, [nemovizorId]);
  return m.get(nemovizorId) ?? null;
}
```

---

## 7. Sdílený klient `lib/nemovizor.js`

Tenhle soubor je **jedinečné místo**, kde se volá Nemovizor API. Všechny `api/*.js` handlery ho používají. **Až bude `@viadorer/nemovizor-sdk` hotový npm balíček, nahradíš tento soubor jeho importem** (jedna změna na ~20 řádků).

```js
// lib/nemovizor.js
//
// Tenký klient Nemovizor API. Server-side only (drží API klíč).
// Nahradí se @viadorer/nemovizor-sdk až bude publikovaný.

const BASE = (process.env.NEMOVIZOR_API_BASE || "https://www.nemovizor.cz").replace(/\/$/, "");
const API_KEY = process.env.NEMOVIZOR_API_KEY || process.env.NEMOVIZOR_API_KEY_DEV || "";
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

  // Vlastní timeout, kdyby Nemovizor visel
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
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

  if (!res.ok) {
    throw new NemovizorError(
      res.status,
      parsed,
      `Nemovizor ${method} ${path} → ${res.status}`
    );
  }
  return parsed;
}

// ─── Public API metody ────────────────────────────────────────────────────

export const nemovizor = {
  /** GET /api/v1/properties — listing search */
  searchProperties: (query) => request("GET", "/api/v1/properties", { query }),

  /** GET /api/v1/properties/{id} */
  getProperty: (uuid) => request("GET", `/api/v1/properties/${uuid}`),

  /** GET /api/v1/properties/by-slug/{slug} */
  getPropertyBySlug: (slug) =>
    request("GET", `/api/v1/properties/by-slug/${encodeURIComponent(slug)}`),

  /** GET /api/v1/properties/{id}/similar */
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

  /** GET /api/v1/brokers/{id}/contact (PII, rate-limited) */
  getBrokerContact: (uuid) => request("GET", `/api/v1/brokers/${uuid}/contact`),
};

// ─── Transformační helpery (camelCase Nemovizor → LogicPro snake_case) ────

import {
  LISTING_TYPE_FROM_NEMOVIZOR, CURRENCY_FROM_NEMOVIZOR,
  PRICE_UNIT_FROM_NEMOVIZOR, SUBTYPE_FROM_NEMOVIZOR,
} from "./nemovizor-codebooks.js";

/**
 * Vezme Nemovizor property (camelCase) a vrátí LogicPro-shape (snake_case + int codebooks).
 * Sidecar industrial fieldy se mergují zvlášť (viz fetchSidecarBatch).
 */
export function toLogicProShape(p, sidecar = null) {
  if (!p) return null;
  return {
    // Identifikace
    id: sidecar?.legacy_logicpro_id ?? null,   // legacy int ID, jen pokud máš v sidecaru
    nemovizor_id: p.id,                        // UUID
    slug: p.slug,

    // Základní
    title: p.title,
    advert_function: LISTING_TYPE_FROM_NEMOVIZOR[p.listingType] ?? 1,
    advert_subtype: sidecar?.sub_type_local
      ? sublocalToLegacyCode(sidecar.sub_type_local)
      : (SUBTYPE_FROM_NEMOVIZOR[p.subtype] ?? 32),
    sub_type_local: sidecar?.sub_type_local ?? null,

    // Cena
    advert_price: p.price,
    advert_price_currency: CURRENCY_FROM_NEMOVIZOR[p.priceCurrency?.toLowerCase()] ?? 1,
    advert_price_unit: PRICE_UNIT_FROM_NEMOVIZOR[p.priceUnit] ?? 1,

    // Lokace
    locality_city: p.city,
    locality_citypart: p.cityPart,
    locality_region: p.region,
    locality_latitude: p.latitude,
    locality_longitude: p.longitude,

    // Plocha
    usable_area: p.area,
    estate_area: p.landArea,
    office_area: p.officesArea,

    // Stav
    year_built: p.yearBuilt,
    year_renovated: p.lastRenovation,
    ceiling_height: p.ceilingHeight,
    lease_type: p.leaseType,

    // Industrial fieldy z sidecaru (nebo null)
    building_class: sidecar?.building_class ?? null,
    certification: sidecar?.certification ?? null,
    floor_load: sidecar?.floor_load ?? null,
    loading_docks: sidecar?.loading_docks ?? null,
    dock_type: sidecar?.dock_type ?? null,
    crane_capacity: sidecar?.crane_capacity ?? null,
    column_grid: sidecar?.column_grid ?? null,
    sprinkler_type: sidecar?.sprinkler_type ?? null,
    rail_access: sidecar?.rail_access ?? false,
    highway_distance: sidecar?.highway_distance ?? null,
    min_divisible_area: sidecar?.min_divisible_area ?? null,

    // Obecné
    description: p.description,
    summary: p.summary,
    listing_images: (p.images ?? []).map((url, i) => ({
      url,
      is_main: i === 0,
      alt: p.title,
    })),

    // Metadata
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function sublocalToLegacyCode(sub) {
  return ({ logistika: 50, retail_park: 51, datacentrum: 52, coworking: 53, polyfunkcni: 54, garaze: 55 })[sub] ?? 32;
}
```

---

## 8. Per-endpoint reimplementace

### 8.1 `api/listings/index.js` (search list)

```js
// api/listings/index.js
import { nemovizor, NemovizorError, toLogicProShape } from "../../lib/nemovizor.js";
import { fetchSidecarBatch } from "../../lib/sidecar.js";
import { SUBTYPE_TO_NEMOVIZOR, LISTING_TYPE_TO_NEMOVIZOR } from "../../lib/nemovizor-codebooks.js";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const ALLOWED_SORTS = {
  price_asc: "price_asc",
  price_desc: "price_desc",
  area_asc: "area_asc",
  area_desc: "area_desc",
  newest: "newest",
};

function intParam(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    advert_function, advert_subtype, locality_city,
    area_min, area_max, price_min, price_max,
    building_class, floor_load, certification,
    loading_docks_min, ceiling_height_min, ceiling_height_max,
    sub_type_local,
    sort, limit: lim, offset: off,
  } = req.query;

  const limit = Math.min(Math.max(intParam(lim) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(intParam(off) || 0, 0);

  // ── Mapování LogicPro → Nemovizor query ────────────────────────────────
  const query = {
    category: "commercial",  // LogicPro je čistě komerční
    limit,
    offset,
  };

  if (advert_function) {
    query.listingType = LISTING_TYPE_TO_NEMOVIZOR[intParam(advert_function)];
  }
  if (advert_subtype) {
    const subs = String(advert_subtype).split(",").map(intParam).filter(Boolean);
    const mapped = subs.map((s) => SUBTYPE_TO_NEMOVIZOR[s]).filter(Boolean);
    if (mapped.length) query.subtype = [...new Set(mapped)].join(",");
  }
  if (locality_city) query.city = String(locality_city);
  if (price_min) query.priceMin = intParam(price_min);
  if (price_max) query.priceMax = intParam(price_max);
  if (area_min) query.areaMin = intParam(area_min);
  if (area_max) query.areaMax = intParam(area_max);
  if (sort && ALLOWED_SORTS[sort]) query.sort = ALLOWED_SORTS[sort];

  // ── Volání Nemovizor ────────────────────────────────────────────────────
  let nemoResp;
  try {
    nemoResp = await nemovizor.searchProperties(query);
  } catch (err) {
    if (err instanceof NemovizorError) {
      console.warn("[listings] Nemovizor failed:", err.status, err.message);
      return res.status(err.status || 502).json({ error: "Upstream API unavailable" });
    }
    throw err;
  }

  const properties = nemoResp.data || [];
  if (properties.length === 0) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    return res.json({ data: [], total: 0, limit, offset });
  }

  // ── Sidecar JOIN ────────────────────────────────────────────────────────
  const ids = properties.map((p) => p.id);
  const sidecars = await fetchSidecarBatch(res, ids);

  let merged = properties.map((p) => toLogicProShape(p, sidecars.get(p.id)));

  // ── Industrial post-filtering (musí být po sidecar mergi) ─────────────
  // Nemovizor neumí filtrovat na building_class, floor_load atd. — musíme to udělat my.
  if (building_class) {
    merged = merged.filter((r) => r.building_class === intParam(building_class));
  }
  if (floor_load) {
    const v = intParam(floor_load);
    merged = merged.filter((r) => r.floor_load != null && r.floor_load >= v);
  }
  if (certification) {
    merged = merged.filter((r) => r.certification != null);
  }
  if (loading_docks_min) {
    const v = intParam(loading_docks_min);
    merged = merged.filter((r) => (r.loading_docks ?? 0) >= v);
  }
  if (ceiling_height_min) {
    const v = Number(ceiling_height_min);
    merged = merged.filter((r) => (r.ceiling_height ?? 0) >= v);
  }
  if (ceiling_height_max) {
    const v = Number(ceiling_height_max);
    merged = merged.filter((r) => (r.ceiling_height ?? 0) <= v || r.ceiling_height == null);
  }
  if (sub_type_local) {
    const wanted = String(sub_type_local).split(",");
    merged = merged.filter((r) => wanted.includes(r.sub_type_local));
  }

  // ⚠️ Pozor: nemoResp.total je total PŘED sidecar filtrem.
  // Pro přesnou pagination potřebujeme buď (a) přidat industrial filtry do Nemovizoru,
  // nebo (b) místo `total: nemoResp.total` vrátit `total: merged.length + offset` (přibližné).
  // Volíme (b) pro v1 — UI ukáže přibližný počet a "Načíst další".
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.json({
    data: merged,
    total: nemoResp.total ?? merged.length,
    limit,
    offset,
    industrial_filter_applied:
      Boolean(building_class || floor_load || certification ||
              loading_docks_min || ceiling_height_min || ceiling_height_max || sub_type_local),
  });
}
```

### 8.2 `api/listings/[id]/index.js` (detail by slug)

> ⚠️ Po migraci se parametr volá `[slug]`, ne `[id]`. Vercel routing: přejmenuj složku.

```js
// api/listings/[slug]/index.js
import { nemovizor, NemovizorError, toLogicProShape } from "../../../lib/nemovizor.js";
import { fetchSidecarOne } from "../../../lib/sidecar.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = String(req.query.slug || "").trim();
  if (!slug || slug.length > 300) {
    return res.status(400).json({ error: "Invalid slug" });
  }

  let property;
  try {
    property = await nemovizor.getPropertyBySlug(slug);
  } catch (err) {
    if (err instanceof NemovizorError) {
      if (err.status === 404) return res.status(404).json({ error: "Not found" });
      return res.status(err.status || 502).json({ error: "Upstream API unavailable" });
    }
    throw err;
  }

  // Nemovizor vrací { data: {...} }
  const p = property.data ?? property;
  const sidecar = await fetchSidecarOne(res, p.id);
  const merged = toLogicProShape(p, sidecar);

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.json(merged);
}
```

### 8.3 `api/listings/[slug]/similar.js`

```js
// api/listings/[slug]/similar.js
import { nemovizor, NemovizorError, toLogicProShape } from "../../../lib/nemovizor.js";
import { fetchSidecarBatch } from "../../../lib/sidecar.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = String(req.query.slug || "").trim();
  if (!slug) return res.status(400).json({ error: "Invalid slug" });

  try {
    // Resolve slug → uuid (similar očekává uuid)
    const detail = await nemovizor.getPropertyBySlug(slug);
    const uuid = (detail.data ?? detail).id;
    const similar = await nemovizor.getSimilar(uuid);

    const props = similar.data || [];
    const sidecars = await fetchSidecarBatch(res, props.map((p) => p.id));
    const merged = props.map((p) => toLogicProShape(p, sidecars.get(p.id)));

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({ data: merged });
  } catch (err) {
    if (err instanceof NemovizorError) {
      return res.status(err.status || 502).json({ error: "Upstream API unavailable" });
    }
    throw err;
  }
}
```

### 8.4 `api/listings/featured.js`

```js
// api/listings/featured.js
import { nemovizor, NemovizorError, toLogicProShape } from "../../lib/nemovizor.js";
import { fetchSidecarBatch } from "../../lib/sidecar.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // V1: featured = top 3 nejnovější komerční.
    // V2: vlastní featured logika v sidecaru (přidat sloupec `is_featured boolean`)
    const resp = await nemovizor.searchProperties({
      category: "commercial",
      sort: "newest",
      limit: 3,
    });
    const props = resp.data || [];
    const sidecars = await fetchSidecarBatch(res, props.map((p) => p.id));
    const merged = props.map((p) => toLogicProShape(p, sidecars.get(p.id)));

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({ data: merged });
  } catch (err) {
    if (err instanceof NemovizorError) {
      return res.status(err.status || 502).json({ error: "Upstream API unavailable" });
    }
    throw err;
  }
}
```

### 8.5 `api/filters.js`

```js
// api/filters.js
import { nemovizor, NemovizorError } from "../lib/nemovizor.js";
import { SUBTYPE_FROM_NEMOVIZOR } from "../lib/nemovizor-codebooks.js";

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

  try {
    const f = await nemovizor.getFilterOptions({ category: "commercial" });
    const data = f.data ?? f;

    // Nemovizor vrací subtypes jako [{ value: "kancelare", count: 12 }]
    // → my mapujeme zpět na int kódy a doplníme labely.
    const subtypes = (data.subtypes || [])
      .map((s) => {
        const intCode = SUBTYPE_FROM_NEMOVIZOR[s.value];
        if (!intCode) return null;
        return { value: intCode, count: s.count, label: SUBTYPE_LABELS[intCode] };
      })
      .filter(Boolean);

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.json({
      cities: data.cities || [],
      subtypes,
      priceRange: data.priceRange,
      areaRange: data.areaRange,
    });
  } catch (err) {
    if (err instanceof NemovizorError) {
      return res.status(err.status || 502).json({ error: "Upstream API unavailable" });
    }
    throw err;
  }
}
```

### 8.6 `api/search.js` (AI-search místo Supabase fulltext)

```js
// api/search.js
import { nemovizor, NemovizorError } from "../lib/nemovizor.js";

function sanitizeQuery(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/[<>{}]/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = sanitizeQuery(req.query.q);
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);
  if (!q || q.length < 2) return res.json({ results: [] });

  try {
    // AI-search vrátí strukturované filtry, ne přímo listingy.
    // Frontend pak může buď přesměrovat na /nabidky?<filtry>, nebo my rovnou
    // zavoláme searchProperties s těmi filtry a vrátíme suggestions.
    const ai = await nemovizor.aiSearch({ query: q, limit });
    const filters = ai.filters ?? ai.data?.filters ?? {};

    // Pro suggest UI (autocomplete) zavolat searchProperties s low limit.
    const list = await nemovizor.searchProperties({
      ...filters,
      category: "commercial", // hard constraint pro LogicPro
      limit,
    });

    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60");
    res.json({
      query: q,
      tier: ai.tier,
      filters,
      results: (list.data || []).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        locality_city: p.city,
        advert_price: p.price,
      })),
    });
  } catch (err) {
    if (err instanceof NemovizorError) {
      console.warn("[search] Nemovizor failed:", err.status);
      return res.json({ results: [] });
    }
    throw err;
  }
}
```

### 8.7 `api/inquiries.js` (POST lead)

```js
// api/inquiries.js
import { nemovizor, NemovizorError } from "../lib/nemovizor.js";
import { requireSupabase } from "../lib/supabase.js";
import { verifyTurnstile } from "../lib/turnstile.js";
import { rateLimit, getClientIp } from "../lib/rate-limit.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(s, max = 1000) {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit per IP (zůstává z LogicPro)
  const ip = getClientIp(req);
  const rl = rateLimit("inquiry:" + ip);
  if (!rl.allowed) {
    res.setHeader("Retry-After", Math.ceil((rl.resetAt - Date.now()) / 1000));
    return res.status(429).json({ error: "Příliš mnoho požadavků. Zkuste to prosím za chvíli." });
  }

  const body = req.body || {};

  // Honeypot
  if (body.website && String(body.website).length > 0) {
    return res.status(200).json({ ok: true });
  }

  // Turnstile (zůstává)
  const turnstile = await verifyTurnstile(body.turnstile_token, ip);
  if (!turnstile.success) {
    return res.status(400).json({ error: "Ověření selhalo, obnovte stránku a zkuste to znovu." });
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 50);
  const message = clean(body.message, 5000);
  const propertySlug = clean(body.property_slug || "", 300); // nově slug místo int listing_id

  if (!name || !email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Vyplňte jméno a platný email." });
  }

  // ── 1) Lead jde do Nemovizoru (primary write) ─────────────────────────
  let nemoLeadId = null;
  try {
    const lead = await nemovizor.createLead({
      name,
      email,
      phone,
      message,
      propertySlug,
      source: "logicpro.cz",
      intentType: "buyer", // nebo derive z body.intent
    });
    nemoLeadId = lead.data?.id || lead.id;
  } catch (err) {
    if (err instanceof NemovizorError && err.status >= 400 && err.status < 500) {
      return res.status(400).json({ error: "Lead invalid", detail: err.body });
    }
    console.error("[inquiries] Nemovizor lead failed:", err);
    // Pokračujeme — chceme zachytit aspoň lokálně.
  }

  // ── 2) Mirror do Supabase pro LogicPro reporting/admin ────────────────
  const supabase = requireSupabase(res);
  if (supabase) {
    await supabase.from("inquiries").insert({
      name, email, phone, message,
      property_slug: propertySlug || null,
      nemovizor_lead_id: nemoLeadId,
      ip,
      source: "logicpro",
    });
  }

  res.json({ ok: true, leadId: nemoLeadId });
}
```

> **Schema update Supabase**: přidat sloupce `property_slug text` a `nemovizor_lead_id uuid` do `inquiries`, případně odstranit `listing_id bigint` (nebo nechat jako legacy).

### 8.8 `api/codebooks.js`

Zůstává **beze změny**. Číselníky jsou lokální LogicPro doménová pravda (UI labely).

---

## 9. Frontend změny

### 9.1 `src/lib/api.js` — beze změny ABI, jen detail volá slug

```js
// src/lib/api.js
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

export function fetchFeatured() { return fetchJSON("/listings/featured"); }

// CHANGE: slug místo id
export function fetchDetail(slug) { return fetchJSON(`/listings/${encodeURIComponent(slug)}`); }
export function fetchSimilar(slug) { return fetchJSON(`/listings/${encodeURIComponent(slug)}/similar`); }

export function fetchCodebooks() { return fetchJSON("/codebooks"); }
export function fetchFilters() { return fetchJSON("/filters"); }
export function fetchSearch(query, limit = 8) {
  return fetchJSON(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}
```

### 9.2 Routing — slug místo id

`src/App.jsx` (nebo wherever routes):

```jsx
<Route path="/detail/:slug" element={<Detail />} />
{/* legacy redirect přes Vercel — viz vercel.json */}
```

`vercel.json`:

```json
{
  "redirects": [
    { "source": "/detail/:id(\\d+)", "destination": "/api/legacy-redirect?id=:id", "statusCode": 301 }
  ]
}
```

Pro `legacy-redirect` viz §11.4.

### 9.3 Detail.jsx

```jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDetail, fetchSimilar } from "../lib/api";

export default function Detail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchDetail(slug).then(setData).catch(setErr);
  }, [slug]);

  if (err) return <div>Nenalezeno. <a href="/nabidky">Zpět na nabídky</a></div>;
  if (!data) return <div>Načítám…</div>;

  return (
    <article>
      <h1>{data.title}</h1>
      {/* … všechny ostatní fieldy fungují stejně jako dřív, mají stejné názvy … */}
      {data.building_class && <span>Třída: {String.fromCharCode(64 + data.building_class)}</span>}
      {/* … */}
    </article>
  );
}
```

### 9.4 Inquiries (kontaktní formulář)

`src/components/InquiryForm.jsx` — místo `listing_id` posílá `property_slug`:

```jsx
const payload = {
  name, email, phone, message,
  property_slug: listing.slug,        // ← bylo: listing_id: listing.id
  turnstile_token: token,
};
```

---

## 10. Auth & admin write path

### 10.1 Auth — Supabase zůstává

LogicPro Auth (registrace, přihlášení, oblíbené, uložená hledání) **nemění**. Nemovizor nemá user-facing auth surface pro third-party projekty (pouze API klíče pro brokerages).

`AuthContext.jsx`, `Profil.jsx`, `Oblibene.jsx` — zůstává jak je.

### 10.2 Admin panel — v1 disable, v2 přes Import API

Admin (`/admin/inzerat/novy`, `/admin/inzerat/:id`) dnes píše do Supabase `listings`. Po cutoveru tam **nikdo nečte**, takže UI by bylo mrtvé.

**v1 řešení**: schovat admin link z navigace, route podržet ale zobrazit info:

> *"Admin editace listingů byla přesunuta do Nemovizoru. Pro správu jdi na [nemovizor.cz/dashboard](https://www.nemovizor.cz/dashboard)."*

**v2 řešení** (až bude potřeba): vystavit admin UI pro:
- **Editaci sidecaru** (`commercial_extensions`) — to jediné LogicPro vlastní a smí měnit
- **Submission do Nemovizoru přes Import API** — vyžaduje agency-scoped API klíč se scope `write:import`. Volá `POST /api/v1/import/batch`, polluje job status.

### 10.3 Sidecar admin UI

Až bude potřeba, přidat:
- `/admin/sidecar/:slug` — formulář pro industrial fieldy
- `POST /api/admin/sidecar` — upsert do `commercial_extensions` (auth: Supabase service role check)

---

## 11. Migrace existujících listings

### 11.1 Inventura

Před migrací udělej:

```sql
-- Kolik máš dnes v Supabase?
select count(*) total,
       count(*) filter (where building_class is not null) with_class,
       count(*) filter (where floor_load is not null) with_load,
       count(*) filter (where advert_subtype between 50 and 55) granular_subtypes
from listings;
```

### 11.2 Tři možnosti

| Volba | Komu | Důsledek |
|---|---|---|
| **A. Bulk import do Nemovizoru** | Pokud máš > 50 listingů a chceš historickou kontinuitu | Vyžaduje agency API key se `write:import`. Použij `POST /api/v1/import/batch`. Industrial fieldy paralelně uložíš do sidecaru. |
| **B. Fresh start** | < 50 listingů nebo testovací data | Smaž Supabase listings, jeď z Nemovizoru. URL break OK. |
| **C. Dual-read transition** | Produkce, nechceš downtime | Po dobu rolloutu čte LogicPro paralelně Supabase i Nemovizor a unifikuje. Po validaci přepneš na Nemovizor-only. |

### 11.3 Postup pro A — bulk import

```js
// scripts/migrate-to-nemovizor.mjs
//
// USAGE:  NEMOVIZOR_API_KEY=<agency_key_with_write_import> node scripts/migrate-to-nemovizor.mjs

import { requireSupabase } from "../lib/supabase.js";
import { nemovizor } from "../lib/nemovizor.js";

const supabase = requireSupabase({ status: () => ({ json: () => {} }) });

// 1) Načti všechny aktivní listingy
const { data: rows, error } = await supabase
  .from("listings")
  .select("*, listing_images!left(*)")
  .eq("active", true);

if (error) { console.error(error); process.exit(1); }
console.log(`Loaded ${rows.length} listings.`);

// 2) Mapuj na Nemovizor ImportBatch shape
import { SUBTYPE_TO_NEMOVIZOR, LISTING_TYPE_TO_NEMOVIZOR, CURRENCY_TO_NEMOVIZOR } from "../lib/nemovizor-codebooks.js";

const properties = rows.map((r) => ({
  external_id: `logicpro:${r.id}`,
  title: r.title,
  listing_type: LISTING_TYPE_TO_NEMOVIZOR[r.advert_function],
  category: "commercial",
  subtype: SUBTYPE_TO_NEMOVIZOR[r.advert_subtype] || "ostatni",
  city: r.locality_city,
  district: r.locality_citypart,
  region: r.locality_region,
  latitude: r.locality_latitude,
  longitude: r.locality_longitude,
  price: r.advert_price,
  price_currency: CURRENCY_TO_NEMOVIZOR[r.advert_price_currency],
  area: r.usable_area,
  land_area: r.estate_area,
  description: r.description,
  year_built: r.year_built,
  ceiling_height: r.ceiling_height,
  images: (r.listing_images || [])
    .sort((a, b) => Number(b.is_main) - Number(a.is_main))
    .map((img, i) => ({ url: img.url, order: i })),
}));

// 3) Submit (batch po 100)
for (let i = 0; i < properties.length; i += 100) {
  const batch = properties.slice(i, i + 100);
  console.log(`Submitting batch ${i / 100 + 1}…`);
  const job = await nemovizor.request("POST", "/api/v1/import/batch", {
    body: { external_source: "logicpro_migration", properties: batch },
  });
  console.log(`  → job ${job.job_id}, polling…`);

  // Poll
  for (;;) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await nemovizor.request("GET", `/api/v1/import/jobs/${job.job_id}`);
    console.log(`    status=${st.status}, ${st.completed_items}/${st.total_items}`);
    if (st.status === "completed" || st.status === "failed") {
      // 4) Pro úspěšné items vlož sidecar industrial fieldy
      for (const item of st.items || []) {
        if (item.status !== "success" || !item.nemovizor_id) continue;
        const src = rows.find((r) => `logicpro:${r.id}` === item.external_id);
        if (!src) continue;
        await supabase.from("commercial_extensions").upsert({
          nemovizor_id: item.nemovizor_id,
          nemovizor_slug: item.nemovizor_slug,
          legacy_logicpro_id: src.id,
          building_class: src.building_class,
          certification: src.certification,
          floor_load: src.floor_load,
          loading_docks: src.loading_docks,
          dock_type: src.dock_type,
          crane_capacity: src.crane_capacity,
          column_grid: src.column_grid,
          sprinkler_type: src.sprinkler_type,
          rail_access: src.rail_access,
          highway_distance: src.highway_distance,
          min_divisible_area: src.min_divisible_area,
          sub_type_local: ({ 50: "logistika", 51: "retail_park", 52: "datacentrum", 53: "coworking", 54: "polyfunkcni", 55: "garaze" })[src.advert_subtype] || null,
        });
      }
      break;
    }
  }
}

console.log("Done.");
```

### 11.4 Legacy 301 redirect handler

```js
// api/legacy-redirect.js
import { requireSupabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  const id = Number(req.query.id);
  if (!Number.isInteger(id)) return res.status(404).end();

  const supabase = requireSupabase(res);
  if (!supabase) return;
  const { data } = await supabase
    .from("commercial_extensions")
    .select("nemovizor_slug")
    .eq("legacy_logicpro_id", id)
    .maybeSingle();

  if (data?.nemovizor_slug) {
    res.setHeader("Location", `/detail/${data.nemovizor_slug}`);
    return res.status(301).end();
  }
  res.setHeader("Location", "/nabidky");
  return res.status(301).end();
}
```

---

## 12. Cache & rate limity

### 12.1 Vrstvy cache

| Vrstva | Životnost | Kdo nastavuje |
|---|---|---|
| Vercel Edge CDN (per `/api/*` response) | viz `Cache-Control` v handleru | LogicPro |
| Nemovizor Vercel CDN (per upstream) | `s-maxage=3600, swr=86400` (OpenAPI), per-endpoint ostatní | Nemovizor |
| LogicPro `lib/rate-limit.js` (per IP) | 60s window, default ceiling | LogicPro |

### 12.2 Doporučené `Cache-Control`

| Endpoint | Cache-Control |
|---|---|
| `/api/listings` | `public, max-age=60, s-maxage=300` |
| `/api/listings/[slug]` | `public, max-age=60, s-maxage=300` |
| `/api/listings/[slug]/similar` | `public, max-age=300, s-maxage=600` |
| `/api/listings/featured` | `public, max-age=300, s-maxage=600` |
| `/api/filters` | `public, max-age=300, s-maxage=600` |
| `/api/codebooks` | `public, max-age=86400, s-maxage=86400, immutable` |
| `/api/search` | `public, max-age=30, s-maxage=60` |
| `/api/inquiries` | žádný cache (POST) |

### 12.3 Nemovizor rate limity

Default 60 req/min per IP, per API key záleží na konfiguraci klíče (default 300/min). Při překročení vrací **429** s `Retry-After`. Náš klient v `lib/nemovizor.js` to neretrejuje **schválně** — místo toho aplikační vrstva spadne na 502 a uživatel uvidí "Načítám…" znovu při scroll/refresh. Pokud začneš dostávat 429 často, je čas zvýšit klíčový limit s Nemovizorem.

---

## 13. Error handling & UX

### 13.1 Co dělat při 5xx z Nemovizoru

```js
} catch (err) {
  if (err instanceof NemovizorError && err.status >= 500) {
    // Nemovizor downtime — vrať prázdná data + status header pro klienta
    res.setHeader("X-Upstream-Status", "unavailable");
    return res.json({ data: [], total: 0, fallback: true });
  }
  throw err;
}
```

V UI sleduj header `X-Upstream-Status: unavailable` a zobraz banner:

> ⚠️ Externí katalog je dočasně nedostupný. Některé nabídky se nemusí načíst.

### 13.2 Sentry / error tracking

Pokud používáš Sentry, capturuj `NemovizorError` s tagem `upstream:nemovizor`:

```js
import * as Sentry from "@sentry/node";
Sentry.captureException(err, { tags: { upstream: "nemovizor", status: err.status } });
```

---

## 14. Lokální vývoj

### 14.1 Proti produkčnímu Nemovizoru

```bash
# .env.local
NEMOVIZOR_API_BASE=https://www.nemovizor.cz
NEMOVIZOR_API_KEY=nv_dev_xxx

vercel dev
# → http://localhost:3000
```

### 14.2 Proti lokálnímu nemovizor-mvp

```bash
# Terminal 1: nemovizor-mvp
cd ~/Downloads/Cascade/Nemovizor\ offline/nemovizor-mvp
npm run dev  # → localhost:3000

# Terminal 2: LogicPro (musí běžet na jiném portu)
cd ~/Downloads/Cascade/LogicPro
# .env.local
# NEMOVIZOR_API_BASE=http://localhost:3000
# NEMOVIZOR_API_KEY=    (prázdný = anonymous, funguje na public read endpointy)
vercel dev --listen 3010  # → localhost:3010
```

---

## 15. Testing

### 15.1 Manuální smoke check

Po nasazení (lokálně nebo prod) projeď:

```bash
BASE=http://localhost:3000   # nebo https://logicpro.cz

curl -s "$BASE/api/listings?limit=3" | jq '.data[0] | {nemovizor_id, slug, title, locality_city, advert_subtype, building_class}'
curl -s "$BASE/api/filters" | jq '.subtypes | length'
curl -s "$BASE/api/listings/featured" | jq '.data | length'

# vezmi slug z prvního výsledku
SLUG=$(curl -s "$BASE/api/listings?limit=1" | jq -r '.data[0].slug')
curl -s "$BASE/api/listings/$SLUG" | jq '.title'
curl -s "$BASE/api/listings/$SLUG/similar" | jq '.data | length'

curl -s "$BASE/api/search?q=kancel%C3%A1%C5%99e%20praha&limit=5" | jq '.results | length'
```

Co očekávat:
- ✅ Listingy mají `nemovizor_id` (uuid) a `slug` (kebab-case)
- ✅ `advert_subtype` je int (25-55), nikdy string
- ✅ `locality_city` je string (CS, např. "Praha")
- ✅ Industrial fieldy (`building_class`, `floor_load`, …) jsou buď int/number nebo `null`
- ✅ Listing s `building_class=1` znamená třída A; pro display `String.fromCharCode(64 + n)`

### 15.2 Unit testy

```js
// __tests__/codebooks.test.js
import { SUBTYPE_TO_NEMOVIZOR, SUBTYPE_FROM_NEMOVIZOR } from "../lib/nemovizor-codebooks.js";

test("subtype roundtrip kancelare", () => {
  expect(SUBTYPE_FROM_NEMOVIZOR[SUBTYPE_TO_NEMOVIZOR[25]]).toBe(25);
});

test("logistika fallbacks to sklady (with sidecar marker)", () => {
  expect(SUBTYPE_TO_NEMOVIZOR[50]).toBe("sklady");
  // sub_type_local: "logistika" — kontroluje business logic ve filtru
});
```

### 15.3 E2E (Playwright/Cypress, volitelné)

- Otevři `/nabidky` → ověř že se zobrazí alespoň 1 listing
- Klikni na první kartu → URL je `/detail/<slug>`, detail zobrazí title
- Vyplň inquiry formulář → check že vrátí `{ok:true}`

---

## 16. Cutover plan

### Fáze 0: Příprava (1-2 dny)

- [ ] Nemovizor API klíč vytvořen (prod + dev)
- [ ] Vercel env vars nastaveny ve všech environments
- [ ] Sidecar tabulka `commercial_extensions` migrována do Supabase
- [ ] `lib/nemovizor.js`, `lib/nemovizor-codebooks.js`, `lib/sidecar.js` zkopírovány

### Fáze 1: Shadow mode (1 týden)

- [ ] Nové handlery deploynuty jako `/api/v2/listings`, `/api/v2/filters` atd. **paralelně** se starými
- [ ] Frontend zatím nezměněn — pořád čte ze `/api/listings` (Supabase)
- [ ] Skript dvojí čtení: každý request na `/api/listings` skrytě volá i `/api/v2/listings` a zaznamenává diffy do Supabase tabulky `migration_diffs`
- [ ] Po týdnu vyhodnotit diff — kolik listingů má významnou odchylku, je třeba doplnit sidecar?

### Fáze 2: Bulk migrace (1 den, mimo špičku)

- [ ] Spuštění `scripts/migrate-to-nemovizor.mjs` — importuje aktivní Supabase listingy do Nemovizoru + naplní sidecar
- [ ] Verifikace: `/api/v2/listings` vrací podobný počet jako `/api/listings`
- [ ] Backup Supabase tabulky `listings` před cutoverem (pro případ rollbacku)

### Fáze 3: Cutover (D-day)

- [ ] Přesměrovat staré handlery: `/api/listings` → volá implementaci z `/api/v2/listings`
- [ ] Aktualizovat routing v `App.jsx`: `/detail/:slug` (přidat) + zachovat `/detail/:id` jako redirect přes `vercel.json`
- [ ] Frontend `src/lib/api.js` — `fetchDetail(slug)` místo `fetchDetail(id)`
- [ ] Deploy
- [ ] Monitor první hodinu: Vercel logs, Sentry, Nemovizor rate limit dashboard

### Fáze 4: Cleanup (po 2 týdnech)

- [ ] Odstranit `/api/v2/*` (sloučeno do `/api/*`)
- [ ] Odstranit `migration_diffs` tabulku
- [ ] Smazat Supabase `listings` tabulku (po dvou týdnech bez incidentu — drž backup)
- [ ] Odstranit nepoužívané indexy, views, RPCs vážoucí se na `listings`

---

## 17. Deployment checklist

Před produkčním deployem:

- [ ] **Env vars na Vercelu**: `NEMOVIZOR_API_BASE`, `NEMOVIZOR_API_KEY`, `NEMOVIZOR_TIMEOUT_MS`
- [ ] **Build pass**: `npm run build` lokálně bez errorů
- [ ] **Smoke test prod**: po deployi spustit §15.1
- [ ] **Vercel redirect** `/detail/:id(\d+)` → `/api/legacy-redirect?id=:id` aktivní (`vercel.json`)
- [ ] **Cache-Control headery** verifikované přes `curl -I https://logicpro.cz/api/listings`
- [ ] **Sentry / monitoring** zachytává `NemovizorError` (test: dočasně nastav špatný `NEMOVIZOR_API_KEY` a ověř že error doteče)
- [ ] **Sidecar RLS policy** — `public_read` aktivní, write jen přes service role
- [ ] **CSP / next image config** — povol Nemovizor R2 image domain (např. `cdn.nemovizor.cz`)
- [ ] **Rollback plan** — Supabase `listings` tabulka netknutá, jednoduchý revert deployment přes Vercel UI

---

## Příloha A: subtype mapping

| LogicPro int | LogicPro label | Nemovizor slug (filtr) | sidecar.sub_type_local | Poznámka |
|---|---|---|---|---|
| 25 | Kanceláře | `kancelare` | — | Direct match |
| 26 | Sklady | `sklady` | — | Direct match |
| 27 | Výroba | `vyroba` | — | Direct match |
| 28 | Obchodní prostory | `obchodni_prostory` | — | Direct match |
| 29 | Ubytování | `ubytovani` | — | Direct match |
| 30 | Restaurace | `restaurace` | — | Direct match |
| 31 | Zemědělský | `zemedelsky` | — | Direct match |
| 32 | Ostatní | `ostatni` | — | Direct match |
| 38 | Činžovní dům | `cinzovni_dum` | — | Direct match |
| 49 | Virtuální kancelář | `virtualni_kancelar` | — | Direct match |
| 50 | Logistika | `sklady` | `logistika` | Aggregate filter |
| 51 | Retail park | `obchodni_prostory` | `retail_park` | Aggregate filter |
| 52 | Datacentrum | `kancelare` | `datacentrum` | Aggregate filter |
| 53 | Coworking | `kancelare` | `coworking` | Aggregate filter |
| 54 | Polyfunkční | `ostatni` | `polyfunkcni` | Aggregate filter |
| 55 | Garáže / Parking | `ostatni` | `garaze` | Aggregate filter |

---

## Příloha B: troubleshooting

### "Listing endpoint vrací 404 i pro existující slug"

Zkontroluj že posíláš slug, ne UUID. Slug je kebab-case (`praha-kancelare-vinohrady-xyz`). Endpoint `by-slug` čeká `slug`, endpoint bez sufixu čeká `uuid`.

### "Vidím v listing seznamu UUID místo slug v URL"

V `toLogicProShape` chybí `slug: p.slug` (přidáno na řádku `slug: p.slug`). Restart Vercel dev (`vercel dev` nepodporuje hot-reload server functions).

### "Industrial filter (floor_load=500) nic nevrátí"

Sidecar tabulka může být prázdná pro tu nemovitost. Filtr `floor_load` se aplikuje POST-fetch, takže pokud sidecar nemá záznam, listing je vyfiltrován pryč. Buď přidej sidecar záznam, nebo nepoužívej industrial filtr (jen základní subtype/city/price).

### "Rate limit 429 z Nemovizoru"

Pravděpodobně nemáš API klíč (anonymous bucket je sdílený s IP). Zkontroluj `NEMOVIZOR_API_KEY` env var. Pokud klíč máš a stále 429 → požádej o zvýšení per-key limitu.

### "Image URLs nefungují (CORS / 403)"

Nemovizor servíruje obrázky z R2/CDN. Přidej do CSP:

```
img-src 'self' https://*.nemovizor.cz https://nemovizor-images.r2.dev;
```

### "Vercel build padá na `import { x } from '../../lib/y.js'`"

Vercel serverless functions vyžadují explicit `.js` extension v ESM. Zkontroluj že `package.json` má `"type": "module"` (má) a všechny relative importy končí na `.js`.

### "Po cutoveru staré `/detail/123` URL hodí 404"

Chybí Vercel redirect. Zkontroluj `vercel.json` že obsahuje:

```json
{ "source": "/detail/:id(\\d+)", "destination": "/api/legacy-redirect?id=:id", "statusCode": 301 }
```

A že `api/legacy-redirect.js` existuje a má namapované `legacy_logicpro_id` v sidecaru.

---

## Co dál

Až bude **`@viadorer/nemovizor-sdk`** publikovaný npm balíček:

```bash
npm install @viadorer/nemovizor-sdk
```

Změna v LogicPro: jediná, v `lib/nemovizor.js`:

```js
// místo vlastní implementace:
import { NemovizorClient, NemovizorError } from "@viadorer/nemovizor-sdk";

export const nemovizor = new NemovizorClient({
  baseUrl: process.env.NEMOVIZOR_API_BASE,
  apiKey: process.env.NEMOVIZOR_API_KEY,
  timeoutMs: Number(process.env.NEMOVIZOR_TIMEOUT_MS || 10_000),
});
export { NemovizorError };
```

Všechny ostatní soubory (`api/listings/*`, codebooks, sidecar) zůstávají beze změny — SDK metody mají stejné signatury jako tento lokální klient.

---

**Otázky / kontakt:** `info@nemovizor.cz` nebo issue v repu `viadorer/nemovizor-sdk`.
