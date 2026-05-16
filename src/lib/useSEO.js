import { useEffect } from "react";

const DEFAULT_TITLE = "LogicPro — Komerční nemovitosti";
const DEFAULT_DESCRIPTION =
  "LogicPro — poradenství a služby v oblasti komerčních nemovitostí v CEE regionu.";

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * useSEO({
 *   title: "Detail — Sklad Praha",
 *   description: "...",
 *   canonical: "/detail/123",
 *   image: "https://...",
 *   noindex: false,
 *   jsonLd: { ... },
 * })
 */
export function useSEO({ title, description, canonical, image, noindex, jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — LogicPro` : DEFAULT_TITLE;
    document.title = fullTitle;

    const desc = description || DEFAULT_DESCRIPTION;
    setMeta("description", desc);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", desc, "property");
    if (image) setMeta("og:image", image, "property");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    if (image) setMeta("twitter:image", image);

    const base = (import.meta.env.VITE_SITE_URL || "https://logicpro.cz").replace(/\/$/, "");
    if (canonical) {
      const url = canonical.startsWith("http") ? canonical : base + canonical;
      setLink("canonical", url);
      setMeta("og:url", url, "property");
    }

    // JSON-LD structured data
    const ldId = "json-ld-page";
    let ldScript = document.getElementById(ldId);
    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.id = ldId;
        ldScript.type = "application/ld+json";
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) {
      ldScript.remove();
    }
  }, [title, description, canonical, image, noindex, jsonLd]);
}
