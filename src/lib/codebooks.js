export const CODEBOOKS = {
  advert_function: { 1: "Prodej", 2: "Pronájem" },
  advert_subtype: {
    25: "Kanceláře", 26: "Sklady", 27: "Výroba", 28: "Obchodní prostory",
    29: "Ubytování", 30: "Restaurace", 31: "Zemědělský", 32: "Ostatní",
    38: "Činžovní dům", 49: "Virtuální kancelář",
  },
  advert_price_currency: { 1: "CZK", 2: "USD", 3: "EUR" },
  advert_price_unit: {
    1: "za nemovitost", 2: "za měsíc", 3: "za m²",
    4: "za m²/měs.", 5: "za m²/rok", 6: "za rok",
  },
  building_condition: {
    1: "Velmi dobrý", 2: "Dobrý", 3: "Špatný", 4: "Ve výstavbě",
    5: "Projekt", 6: "Novostavba", 7: "K demolici",
    8: "Před rekonstrukcí", 9: "Po rekonstrukci",
  },
  building_type: {
    1: "Dřevěná", 2: "Cihlová", 3: "Kamenná", 4: "Montovaná",
    5: "Panelová", 6: "Skeletová", 7: "Smíšená",
  },
  energy_efficiency_rating: { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G" },
};

export function formatPrice(l) {
  const curr = CODEBOOKS.advert_price_currency[l.advert_price_currency] || "";
  const unit = CODEBOOKS.advert_price_unit[l.advert_price_unit] || "";
  const val = l.advert_price >= 1000
    ? Math.round(l.advert_price).toLocaleString("cs-CZ")
    : l.advert_price.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${val} ${curr}/${unit.replace("za ", "")}`.replace(/\/nemovitost/, "").trim();
}

export function formatArea(l) {
  const area = l.usable_area || l.estate_area;
  if (!area) return null;
  return `${area.toLocaleString("cs-CZ")} m²`;
}
