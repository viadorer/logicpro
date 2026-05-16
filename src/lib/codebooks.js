// FE re-export sdileneho ciselnikovniku + format helpers.
// Jediny zdroj pravdy je v /lib/codebooks.js (sdileno se serverem a scraperem).

export { CODEBOOKS, labelFor } from "../../lib/codebooks.js";
import { CODEBOOKS } from "../../lib/codebooks.js";

export function formatPrice(l) {
  if (!l || l.advert_price == null) return "Cena na vyžádání";
  const price = Number(l.advert_price);
  if (!price || price <= 0) return "Cena na vyžádání";

  const curr = CODEBOOKS.advert_price_currency[l.advert_price_currency] || "CZK";
  const unitLabel = CODEBOOKS.advert_price_unit[l.advert_price_unit] || "";

  const val = price >= 1000
    ? Math.round(price).toLocaleString("cs-CZ")
    : price.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // "za nemovitost" je default — nezobrazujeme. Ostatni jednotky pripojime.
  const unitSuffix = unitLabel && unitLabel !== "za nemovitost"
    ? " " + unitLabel
    : "";
  return `${val} ${curr}${unitSuffix}`.trim();
}

export function formatArea(l) {
  if (!l) return null;
  const area = l.usable_area || l.estate_area || l.office_area;
  if (!area) return null;
  return `${Number(area).toLocaleString("cs-CZ")} m²`;
}
