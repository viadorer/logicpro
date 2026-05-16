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
  const listingId = Number(body.listing_id);
  const userId = typeof body.user_id === "string" ? body.user_id : null;

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Vyplňte prosím jméno." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Vyplňte prosím platný e-mail." });
  }
  if (!message || message.length < 5) {
    return res.status(400).json({ error: "Vyplňte prosím zprávu." });
  }
  if (listingId && (!Number.isInteger(listingId) || listingId <= 0)) {
    return res.status(400).json({ error: "Neplatné ID nabídky." });
  }

  const { error } = await supabase.from("inquiries").insert({
    listing_id: listingId || null,
    name,
    email,
    phone: phone || null,
    message,
    user_id: userId || null,
  });

  if (error) {
    console.error("[inquiries] insert error:", error);
    return res.status(500).json({ error: "Odeslání se nezdařilo. Zkuste to prosím znovu." });
  }

  res.status(201).json({ ok: true });
}
