import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__cfTurnstileOnload";
let scriptLoaded = false;
let scriptLoadingPromise = null;

function loadScript() {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    window.__cfTurnstileOnload = () => {
      scriptLoaded = true;
      resolve();
    };
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
  return scriptLoadingPromise;
}

/**
 * Cloudflare Turnstile widget. Pokud neni VITE_TURNSTILE_SITE_KEY,
 * widget se nezobrazi a onVerify se zavola s prazdnym tokenem
 * (v dev / preview prostredi je serverova validace tolerantni).
 */
export default function Turnstile({ onVerify, theme = "auto" }) {
  const ref = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      // V dev rezimu rovnou "overime" prazdnym tokenem.
      onVerify?.("");
      return;
    }
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onVerify?.(token),
        "error-callback": () => onVerify?.(""),
        "expired-callback": () => onVerify?.(""),
      });
    });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      }
    };
  }, [siteKey, theme, onVerify]);

  if (!siteKey) return null;
  return <div ref={ref} className="turnstile" />;
}
