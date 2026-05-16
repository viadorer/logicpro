# LogicPro

Komerční nemovitosti v CEE — React 18 + Vite SPA, Vercel serverless API, Supabase Postgres.

## Stack

- **Frontend**: React 18, react-router v6, react-map-gl + MapLibre, vanilla CSS
- **Backend**: Vercel serverless funkce (`api/*.js`)
- **DB / Auth / Storage**: Supabase (Postgres, RLS, Storage bucket `listing-images`)
- **Spam ochrana**: Cloudflare Turnstile + honeypot + per-IP rate-limit
- **Data zdroj**: scraper z Sreality (108 REAL ESTATE)

## Vývoj

```bash
npm install
cp .env.example .env.local      # vyplň hodnoty
npm run dev                     # Vercel dev (FE + serverless API)
```

`npm run dev` spouští `vercel dev`. Pokud Vercel CLI nemáš, nainstaluj `npm i -g vercel`.

## Build

```bash
npm run build       # vite build → dist/
npm run preview     # serve produkčního buildu lokálně
```

## Database

Schémata jsou v `supabase/`:

| Soubor | Co dělá |
| --- | --- |
| `schema.sql` | základní listings + listing_images |
| `seed.sql` | demo data |
| `migration_features.sql` | profily, oblíbené, uložená hledání, poptávky, fulltext |
| `migration_3_security_hygiene.sql` | `is_admin()`, privilege escalation fix, `external_id`, `updated_at`, `slug`, `status`, JSONB features |

Migrace pouštěj v Supabase SQL editoru postupně podle čísla.

### Vytvoření admin uživatele

```sql
-- Po registraci uživatele přes UI:
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

Privilege escalation je zablokovaná — uživatel si sám role nezmění.

## API endpointy

| Metoda | Path | Popis |
| --- | --- | --- |
| GET | `/api/listings` | seznam s filtry, řazením, paginací |
| GET | `/api/listings/featured` | top 3 listingy na home |
| GET | `/api/listings/:id` | detail listingu |
| GET | `/api/listings/:id/similar` | podobné listingy |
| GET | `/api/codebooks` | číselníky (cache 1 den) |
| GET | `/api/filters` | dostupné filtry s počty (cache 5 min) |
| GET | `/api/search?q=...` | fulltext suggester |
| POST | `/api/inquiries` | odeslání poptávky (Turnstile + honeypot + rate-limit) |
| GET | `/api/sitemap` | sitemap.xml dynamicky z DB (alias `/sitemap.xml`) |
| GET | `/api/cron/scrape` | Vercel Cron — denní refresh + soft-archive (CRON_SECRET) |

Všechny GET endpointy mají `Cache-Control` hlavičky a method check (405 na nepodporované metody).

## Scraper

Dva režimy:

| Spouštění | Co dělá |
| --- | --- |
| `npm run scrape:108` (manuál / GitHub Action) | Full sync — fetch detailů + obrázků + upsert přes UNIQUE(source, external_id) |
| Vercel Cron `/api/cron/scrape` (denně 03:00 UTC) | Lehký refresh — pouze `last_seen_at` + soft-archive listingů, které zmizely ze zdroje |

Po každém běhu scraper označí inzeráty se starým `last_seen_at` (>24h) jako `status='archived'` — přestanou se zobrazovat veřejně, ale data v DB zůstanou.

## Bezpečnost — co je zajištěno

- **PostgREST injection** — `q` v `/api/search` se sanitizuje, primárně se používá `search_vector` (czech_unaccent).
- **Inquiry spam** — všechny vstupy jdou přes `/api/inquiries` (service role, validace, Turnstile, honeypot, rate-limit 5 req/min/IP). Anonymní INSERT do `inquiries` je v RLS zakázán.
- **Privilege escalation** — `profiles_update_own_safe` policy zakazuje uživateli změnit svoje `role` na admin.
- **Listings RLS** — anonymní viděl jen `status IN ('active', 'reserved')`. Admin vidí vše.
- **API method check** — všechny endpointy odmítnou nesprávnou HTTP metodu s 405.
- **Limit cap** — `/api/listings?limit=...` clampnut na 100.

## GDPR / legal

- **Cookie banner** s granulární volbou (Necessary / Analytics / Marketing) — komponenta `CookieBanner`, ukládá do localStorage pod `logicpro_consent_v1`, soubor `src/lib/consent.js` exportuje `getConsent()` / `saveConsent()` pro feature gates.
- **Stránky** `/ochrana-osobnich-udaju` a `/obchodni-podminky`.
- **Password reset** flow — `/zapomenute-heslo` → e-mail → `/reset-hesla`.

## Bezpečnost — co stále chybí (TODO)

- Sentry / Logflare pro server-side errory
- E-mail verification UI flow (Supabase verification je aktivní, ale UI po kliknutí na link chybí)
- 2FA pro admin účty
- IP allowlist pro `/admin`

## Deploy

Vercel projekt → Settings → Environment Variables, nastav všechny proměnné z `.env.example`.
Branch `main` se deployuje automaticky.

## Struktura repa

```
api/                 Vercel serverless functions
lib/                 server-side utility (supabase, turnstile, rate-limit)
public/              static assets (favicon, robots.txt, manifest)
scripts/             scrape-108.mjs
src/
  components/        React komponenty (Header, Footer, Card, Gallery, ...)
  context/           AuthContext
  lib/               client-side helpers (api wrapper, supabase, codebooks)
  pages/             route komponenty (Home, Listings, Detail, Admin*, ...)
supabase/            SQL migrations a seed
```

## License

Proprietární. Vše vyhrazeno.
