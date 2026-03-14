#!/usr/bin/env node
// ============================================================
// LogicPro Scraper — 108 REAL ESTATE z Sreality
// Adaptováno z Nemovizor v3
// Stahuje inzeráty od company=199 (108 REAL ESTATE)
// Mapuje na LogicPro DB schéma (listings + listing_images)
// Ukládá fotky jako Sreality CDN URL (bez re-uploadu)
//
// Usage: node scripts/scrape-108.mjs [--delay 2000] [--max-images 10] [--dry-run]
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ===== Config =====
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}
const DRY_RUN = args.includes("--dry-run");
const DELAY_MS = Number(getArg("--delay", "2000"));
const MAX_IMAGES = Number(getArg("--max-images", "10"));
const COMPANY_ID = 199; // 108 REAL ESTATE
const PER_PAGE = 20;
const SREALITY = "https://www.sreality.cz/api/cs/v2";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ===== Load env =====
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = resolve(ROOT, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Chybi SUPABASE env vars (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)"); process.exit(1); }
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== State (pro deduplikaci a resume) =====
const STATE_FILE = resolve(ROOT, "scripts/.scrape-state.json");
function loadState() {
  try { return JSON.parse(readFileSync(STATE_FILE, "utf8")); }
  catch { return { seen: {}, stats: { inserted: 0, skipped: 0, errors: 0, images: 0 } }; }
}
function saveState(state) { writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }

// ===== Helpers =====
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getItem(items, name) { return items.find(i => i.name === name)?.value ?? null; }
function getItemNum(items, name) { const v = Number(getItem(items, name)); return isNaN(v) ? null : v || null; }
function getItemBool(items, name) { const v = getItem(items, name); return v === true || v === "Ano" || v === 1; }

async function fetchS(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": UA, "Accept": "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (r.status === 429) {
        console.log("  [429 — cekam 60s]");
        await sleep(60000);
        continue;
      }
      if (r.status === 403) {
        console.log("  [403 — cekam 30s]");
        await sleep(30000);
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      const wait = 5000 * (i + 1);
      console.log(`  Retry ${i + 1}/${retries} za ${wait / 1000}s: ${e.message}`);
      await sleep(wait);
    }
  }
}

// ===== Mapovani Sreality -> LogicPro codebooks =====
// advert_function: 1=Prodej, 2=Pronajem
// advert_subtype: 25=Kancelare, 26=Sklady, 27=Vyroba, 28=Obchodni prostory, ...
// building_condition: 1=Velmi dobry, ..., 6=Novostavba, 9=Po rekonstrukci
// building_type: 1=Drevena, 2=Cihlova, ..., 6=Skeletova, 8=Ocelova
// energy_efficiency_rating: 1=A, 2=B, ..., 7=G

const CONDITION_MAP = {
  "Velmi dobrý": 1, "Dobrý": 2, "Špatný": 3, "Ve výstavbě": 4,
  "Projekt": 5, "Novostavba": 6, "K demolici": 7,
  "Před rekonstrukcí": 8, "Po rekonstrukci": 9, "V rekonstrukci": 8,
};
const MATERIAL_MAP = {
  "Dřevostavba": 1, "Dřevěná": 1, "Cihlová": 2, "Kamenná": 3,
  "Montovaná": 4, "Panelová": 5, "Skeletová": 6, "Smíšená": 7, "Ocelová": 8,
  "Železobetonová": 9, "Sendvičový panel": 10,
};
const ENERGY_MAP = {
  "Mimořádně úsporná": 1, "Velmi úsporná": 2, "Úsporná": 3,
  "Méně úsporná": 4, "Nehospodárná": 5, "Velmi nehospodárná": 6,
  "Mimořádně nehospodárná": 7,
};
const HEATING_MAP = {
  "Ústřední": 1, "Plynové": 2, "Elektrické": 3, "Tepelné čerpadlo": 4,
  "Podlahové": 5, "Lokální": 2,
};
// Sreality subtype -> LogicPro advert_subtype
const SUBTYPE_MAP = {
  26: 26, // Sklady -> Sklady
  27: 27, // Vyroba -> Vyroba
  29: 28, // Obchodni prostory
  25: 25, // Kancelare
  30: 29, // Ubytovani
  31: 30, // Restaurace
  32: 31, // Zemedelsky
  38: 38, // Cinzovni dum
  46: 49, // Virtualni kancelar
  40: 25, // Ordinace -> Kancelare
  41: 29, // Apartmany -> Ubytovani
  42: 32, // Ostatni
  // Pozemky (category_main=3, sub=18=komercni)
  18: 28, // Komercni pozemek -> Obchodni prostory
  19: 28, // Pozemek bydleni
};

function mapSubtype(mainCat, subCb) {
  // Pozemky
  if (mainCat === 3) return 28; // Obchodni prostory (nejblizsi pro komercni pozemky)
  return SUBTYPE_MAP[subCb] || 32; // fallback Ostatni
}

function parseLocality(locality) {
  if (!locality) return { city: "Neznámé", street: null, citypart: null, region: null };
  const parts = locality.split(",").map(s => s.trim());
  if (parts.length === 1) return { city: parts[0], street: null, citypart: null, region: null };
  // "Ulice, Mesto - Cast" or "Mesto - Cast"
  const last = parts[parts.length - 1];
  const dashParts = last.split(" - ").map(s => s.trim());
  return {
    city: dashParts[0],
    street: parts.length > 1 ? parts[0] : null,
    citypart: dashParts[1] || null,
    region: null,
  };
}

function parseCeilingHeight(items) {
  const raw = getItem(items, "Výška stropu");
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const m = raw.match(/([\d.,]+)/);
    if (m) return parseFloat(m[1].replace(",", "."));
  }
  return null;
}

function parseFloors(items) {
  const raw = getItem(items, "Podlaží");
  if (typeof raw === "string") {
    const m = raw.match(/celkem\s*(\d+)/i);
    if (m) return parseInt(m[1]);
  }
  return getItemNum(items, "Počet podlaží");
}

// ===== Vlozeni do DB =====
async function insertListing(detail) {
  const seo = detail.seo || {};
  const items = detail.items || [];
  const map = detail.map || {};
  const mainCat = seo.category_main_cb || 4;
  const typeCb = seo.category_type_cb || 1;
  const subCb = seo.category_sub_cb || 32;

  const title = detail.name?.value || "Nemovitost";
  const locality = detail.locality?.value || "";
  const loc = parseLocality(locality);
  const description = detail.text?.value || "";

  const advertFunction = typeCb === 2 ? 2 : 1; // 1=Prodej, 2=Pronajem
  const advertSubtype = mapSubtype(mainCat, subCb);

  // Cena
  let price = detail.price_czk?.value_raw || 0;
  let priceCurrency = 1; // CZK
  let priceUnit = 1; // za nemovitost

  if (advertFunction === 2) {
    // Pronajem — cena za mesic
    priceUnit = 2; // za mesic
  }

  // Pokud je cena "na dotaz" (= 1 CZK), nastavime 0
  if (price <= 1) price = 0;

  // Plochy
  const usableArea = getItemNum(items, "Užitná plocha") || getItemNum(items, "Celková plocha") || getItemNum(items, "Plocha zastavěná");
  const estateArea = getItemNum(items, "Plocha pozemku");
  const officeArea = getItemNum(items, "Plocha kancelářská") || getItemNum(items, "Administrativa");

  // Stavba
  const condRaw = getItem(items, "Stav objektu");
  const materialRaw = getItem(items, "Stavba");
  const energyRaw = getItem(items, "Energetická náročnost budovy");
  const heatingRaw = getItem(items, "Topení");

  const listing = {
    title,
    advert_function: advertFunction,
    advert_type: 4, // Komercni
    advert_subtype: advertSubtype,
    advert_price: price,
    advert_price_currency: priceCurrency,
    advert_price_unit: priceUnit,
    description: description || null,
    locality_city: loc.city,
    locality_street: loc.street,
    locality_citypart: loc.citypart,
    locality_region: loc.region,
    locality_latitude: map.lat || null,
    locality_longitude: map.lon || null,
    usable_area: usableArea,
    estate_area: estateArea,
    office_area: officeArea,
    building_condition: CONDITION_MAP[condRaw] || null,
    building_type: MATERIAL_MAP[materialRaw] || null,
    elevator: getItemBool(items, "Výtah") ? 1 : 0,
    parking_lots: getItemNum(items, "Parking") || 0,
    garage: getItemBool(items, "Garáž") ? 1 : 0,
    energy_efficiency_rating: ENERGY_MAP[energyRaw] || null,
    floors: parseFloors(items),
    ceiling_height: parseCeilingHeight(items),
    heating_type: HEATING_MAP[heatingRaw] || null,
    year_built: getItemNum(items, "Rok kolaudace") || getItemNum(items, "Rok výstavby"),
    year_renovated: getItemNum(items, "Rok rekonstrukce"),
    features: JSON.stringify(extractFeatures(detail, items)),
  };

  // Odstranit null hodnoty
  for (const k of Object.keys(listing)) {
    if (listing[k] === null || listing[k] === undefined) delete listing[k];
  }

  if (DRY_RUN) {
    console.log("  [DRY] Listing:", JSON.stringify(listing, null, 2).slice(0, 300));
    return { id: 0, skipped: false };
  }

  const { data, error } = await sb.from("listings").insert(listing).select("id").single();
  if (error) {
    throw new Error(`DB insert: ${error.message}`);
  }
  return { id: data.id, skipped: false };
}

function extractFeatures(detail, items) {
  const features = [];
  // Z labelu
  const allLabels = []
    .concat(detail.labelsReleased?.[0] || [])
    .concat(detail.labelsReleased?.[1] || []);
  if (allLabels.includes("elevator")) features.push("Výtah");
  if (allLabels.includes("garage")) features.push("Garáž");
  if (allLabels.includes("parking")) features.push("Parkování");
  if (allLabels.includes("terrace")) features.push("Terasa");
  if (allLabels.includes("balcony")) features.push("Balkón");

  // Z polozek
  if (getItemBool(items, "Výtah")) features.push("Výtah");
  if (getItemBool(items, "Garáž")) features.push("Garáž");
  if (getItemBool(items, "Klimatizace")) features.push("Klimatizace");
  if (getItemBool(items, "Bezbariérový")) features.push("Bezbariérový přístup");

  // Deduplikace
  return [...new Set(features)];
}

async function insertImages(listingId, detail) {
  const srImgs = detail._embedded?.images || [];
  const imgs = srImgs.slice(0, MAX_IMAGES);
  let count = 0;

  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    // Pouzijeme "view" URL (749x562) — nejvetsi bez watermarku
    const url = img._links?.view?.href || img._links?.gallery?.href || img._links?.self?.href;
    if (!url) continue;

    if (DRY_RUN) {
      console.log(`  [DRY] Image ${i}: ${url.slice(0, 80)}`);
      count++;
      continue;
    }

    const { error } = await sb.from("listing_images").insert({
      listing_id: listingId,
      url,
      alt: detail.name?.value || null,
      is_main: i === 0 ? 1 : 0,
      sort_order: i,
    });
    if (error) console.error(`  Chyba image ${i}: ${error.message}`);
    else count++;
  }
  return count;
}

// ===== Main =====
async function main() {
  console.log(`
  LogicPro Scraper — 108 REAL ESTATE
  Company ID: ${COMPANY_ID} | Delay: ${DELAY_MS}ms | Max images: ${MAX_IMAGES}
  ${DRY_RUN ? "*** DRY RUN — nic se neulozi ***" : "LIVE — data se ukladaji do Supabase"}
`);

  const state = loadState();
  const t0 = Date.now();

  // 1. Stahni seznam vsech inzeratu od 108 REAL ESTATE
  console.log("Nacitam seznam inzeratu od 108 REAL ESTATE...");
  const allEstates = [];
  let page = 0;

  while (true) {
    await sleep(DELAY_MS);
    try {
      const data = await fetchS(
        `${SREALITY}/estates?company=${COMPANY_ID}&per_page=${PER_PAGE}&page=${page}`
      );
      const estates = data?._embedded?.estates ?? [];
      if (!estates.length) break;

      allEstates.push(...estates);
      console.log(`  Strana ${page + 1}: ${estates.length} inzeratu (celkem ${allEstates.length})`);

      if (allEstates.length >= (data.result_size || 999)) break;
      page++;
    } catch (e) {
      console.error(`  Chyba pri nacitani strany ${page}: ${e.message}`);
      break;
    }
  }

  console.log(`\nNalezeno ${allEstates.length} inzeratu. Zpracovavam detaily...\n`);

  // 2. Pro kazdy inzerat stahni detail a vloz do DB
  for (let i = 0; i < allEstates.length; i++) {
    const est = allEstates[i];
    const hid = est.hash_id;
    const key = `sr-${hid}`;

    // Deduplikace
    if (state.seen[key]) {
      process.stdout.write("s");
      state.stats.skipped++;
      continue;
    }

    console.log(`\n[${i + 1}/${allEstates.length}] ${est.name} — ${est.locality}`);

    try {
      // Opatrny delay
      await sleep(DELAY_MS);

      // Detail
      const detail = await fetchS(`${SREALITY}/estates/${hid}`);
      if (!detail?.name) {
        console.log("  Prazdny detail, preskakuji");
        state.stats.errors++;
        continue;
      }

      // Vlozit listing
      const { id, skipped } = await insertListing(detail);
      if (skipped) {
        state.stats.skipped++;
        process.stdout.write("d");
      } else {
        // Vlozit obrazky
        const imgCount = await insertImages(id, detail);
        state.stats.inserted++;
        state.stats.images += imgCount;
        console.log(`  OK — id=${id}, ${imgCount} fotek`);
      }

      state.seen[key] = true;
      if (state.stats.inserted % 3 === 0) saveState(state);

    } catch (e) {
      console.error(`  CHYBA: ${e.message}`);
      state.stats.errors++;
    }
  }

  saveState(state);
  const totalMin = ((Date.now() - t0) / 60000).toFixed(1);
  console.log(`
  HOTOVO za ${totalMin} min
  Vlozeno: ${state.stats.inserted}
  Preskoceno: ${state.stats.skipped}
  Chyby: ${state.stats.errors}
  Obrazku: ${state.stats.images}
`);
}

main().catch(e => { console.error("Fatalni chyba:", e); process.exit(1); });
