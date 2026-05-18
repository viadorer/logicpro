import { requireSupabase } from "../lib/supabase.js";
import { verifyTurnstile } from "../lib/turnstile.js";
import { rateLimit, getClientIp } from "../lib/rate-limit.js";
import { getDataSource } from "../lib/data-source.js";
import { nemovizor, NemovizorError } from "../lib/nemovizor.js";

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

  const supabase = requireSupabase(res);
  if (!supabase) return;

  // Rate limit per IP
  const ip = getClientIp(req);
  const rl = rateLimit("inquiry:" + ip);
  if (!rl.allowed) {
    res.setHeader("Retry-After", Math.ceil((rl.resetAt - Date.now()) / 1000));
    return res.status(429).json({ error: "Příliš mnoho požadavků. Zkuste to prosím za chvíli." });
  }

  const body = req.body || {};

  // Honeypot — pole "website" je v UI hidden, lidsky uzivatel ho nevyplni.
  if (body.website && String(body.website).length > 0) {
    // Ticha ignorace pro boty.
    return res.status(200).json({ ok: true });
  }

  // Cloudflare Turnstile token
  const turnstile = await verifyTurnstile(body.turnstile_token, ip);
  if (!turnstile.success) {
    return res.status(400).json({
      error: "Ověření selhalo, obnovte stránku a zkuste to znovu.",
      detail: turnstile.errorCodes || turnstile.error,
    });
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 50);
  const message = clean(body.message, 5000);
  const userId = typeof body.user_id === "string" ? body.user_id : null;

  // Listing reference — buď int (legacy Supabase), nebo string slug (Nemovizor mode).
  // FE může poslat oboje, akceptujeme co dorazí.
  const listingIdRaw = body.listing_id;
  const propertySlug = clean(body.property_slug, 300);
  const listingIdInt =
    typeof listingIdRaw === "number" || /^\d+$/.test(String(listingIdRaw || ""))
      ? Number(listingIdRaw)
      : null;

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Vyplňte prosím jméno." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Vyplňte prosím platný e-mail." });
  }
  if (!message || message.length < 5) {
    return res.status(400).json({ error: "Vyplňte prosím zprávu." });
  }
  if (listingIdInt !== null && (!Number.isInteger(listingIdInt) || listingIdInt <= 0)) {
    return res.status(400).json({ error: "Neplatné ID nabídky." });
  }

  // ── Mirror do Nemovizor /leads, pokud jsme v nemovizor módu ─────────────
  let nemovizorLeadId = null;
  if (getDataSource() === "nemovizor") {
    try {
      const lead = await nemovizor.createLead({
        name,
        email,
        phone: phone || undefined,
        message,
        propertySlug: propertySlug || undefined,
        source: "logicpro.cz",
        intentType: "buyer",
      });
      nemovizorLeadId = lead.data?.id || lead.id || null;
    } catch (err) {
      if (err instanceof NemovizorError) {
        console.warn("[inquiries] Nemovizor /leads failed:", err.status, err.message);
        // Pokracujeme — chceme aspon Supabase zaznam jako fallback.
      } else {
        throw err;
      }
    }
  }

  // ── Supabase insert (LogicPro reporting / admin UI) ─────────────────────
  // POZN: pokud `inquiries` tabulka nema sloupec `property_slug` nebo
  // `nemovizor_lead_id`, dropni je z payloadu (migrace 5 je v draftu).
  const payload = {
    listing_id: listingIdInt,
    name,
    email,
    phone: phone || null,
    message: propertySlug && !listingIdInt
      ? `[Nemovizor: ${propertySlug}] ${message}` // bezpecny fallback, viditelne v adminu
      : message,
    user_id: userId || null,
  };

  const { error } = await supabase.from("inquiries").insert(payload);

  if (error) {
    console.error("[inquiries] insert error:", error);
    // Pokud Nemovizor lead prosel, request je uspesny — Supabase mirror je nice-to-have
    if (nemovizorLeadId) {
      return res.status(201).json({ ok: true, nemovizor_lead_id: nemovizorLeadId, mirror: "failed" });
    }
    return res.status(500).json({ error: "Odeslání se nezdařilo. Zkuste to prosím znovu." });
  }

  res.status(201).json({ ok: true, nemovizor_lead_id: nemovizorLeadId });
}
