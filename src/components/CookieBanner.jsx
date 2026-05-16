import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, saveConsent, hasDecided } from "../lib/consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!hasDecided()) {
      // Krátký delay aby banner neflashoval pri page load.
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
    const c = getConsent();
    setAnalytics(c.analytics);
    setMarketing(c.marketing);
  }, []);

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
  }
  function rejectAll() {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
  }
  function saveSelection() {
    saveConsent({ analytics, marketing });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <strong id="cookie-banner-title">Soubory cookies</strong>
          <p id="cookie-banner-desc">
            Používáme nezbytné cookies pro chod webu a volitelné cookies pro analytiku a marketing.
            Detaily v{" "}
            <Link to="/ochrana-osobnich-udaju">Zásadách ochrany osobních údajů</Link>.
          </p>
          {showDetails && (
            <div className="cookie-banner__opts">
              <label className="cookie-banner__opt">
                <input type="checkbox" checked disabled readOnly />
                <span><strong>Nezbytné</strong> — chod webu, přihlášení, košík.</span>
              </label>
              <label className="cookie-banner__opt">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span><strong>Analytika</strong> — anonymní statistiky návštěvnosti.</span>
              </label>
              <label className="cookie-banner__opt">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span><strong>Marketing</strong> — personalizace nabídek.</span>
              </label>
            </div>
          )}
        </div>
        <div className="cookie-banner__actions">
          {!showDetails ? (
            <>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setShowDetails(true)}
              >
                Nastavit
              </button>
              <button type="button" className="btn btn--outline btn--sm" onClick={rejectAll}>
                Odmítnout
              </button>
              <button type="button" className="btn btn--fill btn--sm" onClick={acceptAll}>
                Přijmout vše
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--outline btn--sm" onClick={rejectAll}>
                Odmítnout
              </button>
              <button type="button" className="btn btn--fill btn--sm" onClick={saveSelection}>
                Uložit volbu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
