export const CODEBOOKS = {
  advert_function: { 1: "Prodej", 2: "Pronájem" },
  advert_subtype: {
    25: "Kanceláře", 26: "Sklady", 27: "Výroba", 28: "Obchodní prostory",
    29: "Ubytování", 30: "Restaurace", 31: "Zemědělský", 32: "Ostatní",
    38: "Činžovní dům", 49: "Virtuální kancelář",
    50: "Logistika", 51: "Retail park", 52: "Datacentrum",
    53: "Coworking", 54: "Polyfunkční", 55: "Garáže / Parking",
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
    5: "Panelová", 6: "Skeletová", 7: "Smíšená", 8: "Ocelová",
    9: "Železobetonová", 10: "Sendvičový panel",
  },
  building_class: { 1: "A", 2: "B", 3: "C" },
  certification: {
    1: "BREEAM Outstanding", 2: "BREEAM Excellent", 3: "BREEAM Very Good", 4: "BREEAM Good", 5: "BREEAM Pass",
    6: "LEED Platinum", 7: "LEED Gold", 8: "LEED Silver", 9: "LEED Certified",
    10: "DGNB Platin", 11: "DGNB Gold", 12: "DGNB Silber",
  },
  energy_efficiency_rating: { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G" },
  floor_load: {
    1: "do 3 t/m\u00B2", 2: "3\u20135 t/m\u00B2", 3: "5\u20138 t/m\u00B2", 4: "8\u201310 t/m\u00B2", 5: "nad 10 t/m\u00B2",
  },
  sprinkler_type: {
    1: "Bez sprinkler\u016F", 2: "Mokr\u00FD syst\u00E9m", 3: "Such\u00FD syst\u00E9m",
    4: "ESFR", 5: "P\u011Bnov\u00FD",
  },
  heating_type: {
    1: "\u00DAst\u0159edn\u00ED", 2: "Plynov\u00E9", 3: "Elektrick\u00E9", 4: "Tepeln\u00E9 \u010Derpadlo",
    5: "Podlahov\u00E9", 6: "VZT + rekuperace", 7: "Bez vyt\u00E1p\u011Bn\u00ED",
  },
  parking_type: {
    1: "Venkovn\u00ED", 2: "Kryt\u00E9", 3: "Podzemn\u00ED gar\u00E1\u017E", 4: "Parkovac\u00ED d\u016Fm",
    5: "Kamionov\u00E9 st\u00E1n\u00ED", 6: "Bez parkov\u00E1n\u00ED",
  },
  lease_type: {
    1: "Triple Net (NNN)", 2: "Double Net (NN)", 3: "Gross Lease",
    4: "Modified Gross", 5: "Turnover Rent",
  },
  dock_type: {
    1: "Nakl\u00E1dac\u00ED rampa", 2: "Drive-in vrata", 3: "Cross-dock",
    4: "N\u00E1jezdov\u00E1 rampa", 5: "Bo\u010Dn\u00ED nakl\u00E1dka",
  },
  land_type: {
    1: "Komer\u010Dn\u00ED", 2: "Pr\u016Fmyslov\u00E9", 3: "Sm\u00ED\u0161en\u00E9", 4: "Zem\u011Bd\u011Blsk\u00E9",
    5: "Stavebn\u00ED", 6: "Brownfield", 7: "Greenfield",
  },
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
  return `${area.toLocaleString("cs-CZ")} m\u00B2`;
}
