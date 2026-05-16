// Jednoduchy in-memory rate limiter pro Vercel serverless funkce.
// POZN: Vercel serverless je serverless => instance se sdili napric requesty
// jen po dobu zivotnosti, takze rate-limit neni globalni napric regiony.
// Pro produkci doporucujeme Upstash Redis + @upstash/ratelimit, ale tohle
// pokryje 95 % botu a opakovanych submitu z jedne IP.

const buckets = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_RPM = 5;

export function rateLimit(key) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }
  bucket.count += 1;
  buckets.set(key, bucket);

  // Garbage collect staré klíče
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

  return {
    allowed: bucket.count <= MAX_RPM,
    remaining: Math.max(0, MAX_RPM - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string") return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}
