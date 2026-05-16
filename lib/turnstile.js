// Server-side overeni Cloudflare Turnstile tokenu.
// Setup: https://dash.cloudflare.com/?to=/:account/turnstile
// Env vars potreba:
//   TURNSTILE_SECRET_KEY     — secret z dashboardu (NE site key)
// Pokud TURNSTILE_SECRET_KEY neni nastaven, overeni je vypnute (dev mode).

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev / preview prostredi bez Turnstile — povolit, ale logovat.
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set, skipping verification");
    return { success: true, dev: true };
  }
  if (!token) return { success: false, error: "missing-token" };

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (ip) params.append("remoteip", ip);

    const r = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(5000),
    });
    const data = await r.json();
    return { success: !!data.success, errorCodes: data["error-codes"] };
  } catch (e) {
    console.error("[turnstile] verify failed:", e);
    return { success: false, error: "verify-failed" };
  }
}
