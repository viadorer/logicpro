#!/usr/bin/env node
// =====================================================================
// LogicPro → Nemovizor migration (bulk import + sidecar backfill)
// =====================================================================
// Čte aktivní listingy z Supabase a importuje je do Nemovizoru přes
// /api/v1/import/batch. Po úspěšném importu naplní property_extensions
// sidecar industrial fieldy + legacy_logicpro_id (pro 301 redirecty).
//
// VYŽADUJE:
//   * SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//   * NEMOVIZOR_API_URL (default: https://www.nemovizor.cz)
//   * NEMOVIZOR_API_KEY (agency-scoped, scope `write:import`)
//
// USAGE:
//   node scripts/migrate-to-nemovizor.mjs --dry-run           # default — žádné API volání, jen mapping check
//   node scripts/migrate-to-nemovizor.mjs --apply             # opravdu provede import
//   node scripts/migrate-to-nemovizor.mjs --apply --batch=50  # custom batch size (default 100)
//   node scripts/migrate-to-nemovizor.mjs --apply --limit=10  # jen prvních N (smoke test)
// =====================================================================

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Načti .env.local pokud existuje (bez závislosti na dotenv) ───────────
const envPath = resolve(ROOT, ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const args = process.argv.slice(2);
function getArg(name, def) {
  const found = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!found) return def;
  if (found.includes("=")) return found.split("=")[1];
  const i = args.indexOf(found);
  return args[i + 1] || def;
}

const DRY_RUN = !args.includes("--apply");
const BATCH_SIZE = Number(getArg("batch", "100"));
const LIMIT = Number(getArg("limit", "0")) || null;

if (DRY_RUN) {
  console.log("ℹ️  DRY RUN — nevolá Nemovizor ani neupravuje Supabase.");
  console.log("    Pro skutečné provedení použij --apply");
}

// ── Konfigurace ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEMOVIZOR_BASE = (process.env.NEMOVIZOR_API_URL || "https://www.nemovizor.cz").replace(/\/$/, "");
const NEMOVIZOR_KEY = process.env.NEMOVIZOR_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v env.");
  process.exit(1);
}
if (!DRY_RUN && !NEMOVIZOR_KEY) {
  console.error("❌ Chybí NEMOVIZOR_API_KEY v env (vyžadováno pro --apply).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ── Codebook mapping (musí ladit s lib/nemovizor-codebooks.js) ──────────
const LISTING_TYPE = { 1: "sale", 2: "rent" };
const CURRENCY = { 1: "czk", 2: "usd", 3: "eur" };
const SUBTYPE = {
  25: "kancelare", 26: "sklady", 27: "vyroba", 28: "obchodni_prostory",
  29: "ubytovani", 30: "restaurace", 31: "zemedelsky", 32: "ostatni",
  38: "cinzovni_dum", 49: "virtualni_kancelar",
  50: "sklady", 51: "obchodni_prostory", 52: "kancelare",
  53: "kancelare", 54: "ostatni", 55: "ostatni",
};
const SUB_TYPE_LOCAL = {
  50: "logistika", 51: "retail_park", 52: "datacentrum",
  53: "coworking", 54: "polyfunkcni", 55: "garaze",
};

// ── Nemovizor HTTP helper ────────────────────────────────────────────────
async function nemoRequest(method, path, body) {
  const url = NEMOVIZOR_BASE + path;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${NEMOVIZOR_KEY}`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    throw new Error(`Nemovizor ${method} ${path} → ${res.status}: ${typeof parsed === "string" ? parsed : JSON.stringify(parsed).slice(0, 300)}`);
  }
  return parsed;
}

// ── 1) Načti listingy ze Supabase ────────────────────────────────────────
console.log("\n[1/4] Loading listings from Supabase…");
let q = supabase
  .from("listings")
  .select("*, listing_images!left(url, alt, is_main, sort_order)")
  .in("status", ["active", "reserved"])
  .order("id", { ascending: true });
if (LIMIT) q = q.limit(LIMIT);

const { data: rows, error } = await q;
if (error) {
  console.error("❌ Supabase error:", error.message);
  process.exit(1);
}
console.log(`   Loaded ${rows.length} listings.`);

// ── 2) Mapuj na Nemovizor Import shape ──────────────────────────────────
console.log("\n[2/4] Mapping to Nemovizor Import shape…");
const properties = rows.map((r) => ({
  external_id: `logicpro:${r.id}`,
  title: r.title,
  listing_type: LISTING_TYPE[r.advert_function] || "sale",
  category: "commercial",
  subtype: SUBTYPE[r.advert_subtype] || "ostatni",
  city: r.locality_city || undefined,
  district: r.locality_citypart || undefined,
  street: r.locality_street || undefined,
  region: r.locality_region || undefined,
  zip: r.locality_zip || undefined,
  latitude: r.locality_latitude ?? undefined,
  longitude: r.locality_longitude ?? undefined,
  price: r.advert_price ?? undefined,
  price_currency: CURRENCY[r.advert_price_currency] || "czk",
  price_unit: r.advert_price_unit ? String(r.advert_price_unit) : undefined,
  area: r.usable_area ?? undefined,
  land_area: r.estate_area ?? undefined,
  description: r.description || undefined,
  year_built: r.year_built ?? undefined,
  ceiling_height: r.ceiling_height ?? undefined,
  active: r.status === "active",
  images: (r.listing_images || [])
    .slice()
    .sort((a, b) => {
      if (a.is_main !== b.is_main) return (b.is_main || 0) - (a.is_main || 0);
      return (a.sort_order || 0) - (b.sort_order || 0);
    })
    .map((img, i) => ({ url: img.url, title: img.alt || r.title, order: i })),
}));

console.log(`   Mapped ${properties.length} properties. First mapping preview:`);
console.log("   " + JSON.stringify(properties[0] ?? {}, null, 2).split("\n").join("\n   "));

if (DRY_RUN) {
  console.log("\n[3/4] SKIPPED (dry-run): would submit batch import.");
  console.log("[4/4] SKIPPED (dry-run): would write sidecar rows.");
  console.log("\n✅ Dry run done. Spuštění naživo: node scripts/migrate-to-nemovizor.mjs --apply");
  process.exit(0);
}

// ── 3) Submit batch import + poll ───────────────────────────────────────
console.log("\n[3/4] Submitting batch import to Nemovizor…");
const completedItems = [];
for (let i = 0; i < properties.length; i += BATCH_SIZE) {
  const slice = properties.slice(i, i + BATCH_SIZE);
  console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1} (${slice.length} properties)…`);

  const job = await nemoRequest("POST", "/api/v1/import/batch", {
    external_source: "logicpro_migration",
    properties: slice,
  });
  console.log(`     job_id=${job.job_id}, polling…`);

  for (;;) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await nemoRequest("GET", `/api/v1/import/jobs/${job.job_id}`);
    process.stdout.write(`     status=${status.status} ${status.completed_items}/${status.total_items}\r`);
    if (status.status === "completed" || status.status === "failed") {
      console.log("");
      const ok = (status.items || []).filter((it) => it.status === "success");
      const warn = (status.items || []).filter((it) => it.status === "warning");
      const err = (status.items || []).filter((it) => it.status === "error");
      console.log(`     ✅ ok=${ok.length}  ⚠️  warn=${warn.length}  ❌ err=${err.length}`);
      if (err.length) {
        console.log("     První chyba:", JSON.stringify(err[0], null, 2));
      }
      completedItems.push(...(status.items || []));
      break;
    }
  }
}

// ── 4) Sidecar backfill ─────────────────────────────────────────────────
console.log("\n[4/4] Writing sidecar (property_extensions) for successful imports…");
const rowsById = new Map(rows.map((r) => [r.id, r]));
let sidecarOk = 0;
let sidecarErr = 0;

for (const item of completedItems) {
  if (item.status !== "success" || !item.nemovizor_id) continue;
  const m = item.external_id?.match(/^logicpro:(\d+)$/);
  if (!m) continue;
  const legacyId = Number(m[1]);
  const src = rowsById.get(legacyId);
  if (!src) continue;

  const sidecar = {
    property_id: item.nemovizor_id,
    legacy_logicpro_id: legacyId,
    source: "nemovizor",
    building_class: src.building_class ?? null,
    certification: src.certification != null ? [String(src.certification)] : null,
    floor_load: src.floor_load ?? null,
    loading_docks: src.loading_docks ?? null,
    dock_type: src.dock_type ?? null,
    drive_in_gates: src.drive_in_gates ?? null,
    crane_capacity: src.crane_capacity ?? null,
    column_grid: src.column_grid ?? null,
    sprinkler_type: src.sprinkler_type ?? null,
    rail_access: Boolean(src.rail_access),
    highway_distance: src.highway_distance ?? null,
    lease_type: src.lease_type ?? null,
    ceiling_height: src.ceiling_height ?? null,
    min_divisible_area: src.min_divisible_area ?? null,
    office_area: src.office_area ?? null,
    sub_type_local: SUB_TYPE_LOCAL[src.advert_subtype] ?? null,
    mirror_subtype: src.advert_subtype ?? null,
    mirror_advert_function: src.advert_function ?? null,
    mirror_locality_city: src.locality_city ?? null,
    mirror_locality_region: src.locality_region ?? null,
    mirror_latitude: src.locality_latitude ?? null,
    mirror_longitude: src.locality_longitude ?? null,
    mirror_price: src.advert_price ?? null,
    mirror_price_currency: src.advert_price_currency ?? null,
    mirror_price_unit: src.advert_price_unit ?? null,
    mirror_usable_area: src.usable_area ?? null,
    mirror_estate_area: src.estate_area ?? null,
    mirror_main_image_url: src.listing_images?.find((i) => i.is_main)?.url || src.listing_images?.[0]?.url || null,
    mirror_title: src.title,
    mirror_status: src.status,
    last_synced_at: new Date().toISOString(),
  };

  const { error: insErr } = await supabase
    .from("property_extensions")
    .upsert(sidecar, { onConflict: "property_id" });

  if (insErr) {
    console.warn(`     ❌ sidecar upsert failed for ${item.external_id}:`, insErr.message);
    sidecarErr++;
  } else {
    sidecarOk++;
  }
}
console.log(`   Sidecar: ${sidecarOk} ok, ${sidecarErr} errors.`);

console.log("\n✅ Migration done.");
console.log("");
console.log("Next steps:");
console.log("  1. V Vercel project settings nastav DATA_SOURCE=nemovizor");
console.log("  2. Redeploy (nebo počkej na další push)");
console.log("  3. Otevři https://logicpro.cz/nabidky a ověř, že načítáš data");
console.log("     z Nemovizoru (response header X-Data-Source: nemovizor).");
