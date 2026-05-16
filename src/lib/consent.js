// Spravce GDPR consent stavu. Bezpecny, no-tracking-by-default.
// Ulozeni: localStorage pod klicem "logicpro_consent_v1".

const KEY = "logicpro_consent_v1";

const DEFAULT = {
  necessary: true,   // nelze odmitnout (session, auth)
  analytics: false,
  marketing: false,
  ts: null,          // ISO datum udeleni
  version: 1,
};

export function getConsent() {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

export function saveConsent(partial) {
  if (typeof window === "undefined") return;
  const next = {
    ...getConsent(),
    ...partial,
    necessary: true,
    ts: new Date().toISOString(),
    version: 1,
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("consent:change", { detail: next }));
  return next;
}

export function hasDecided() {
  return getConsent().ts !== null;
}

export function resetConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("consent:change", { detail: DEFAULT }));
}
