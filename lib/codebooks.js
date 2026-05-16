// =====================================================================
// LogicPro codebooks — JEDINY zdroj pravdy pro vsechny ciselniky.
// Importuji se z:
//   - api/codebooks.js          (vystavuje pres HTTP)
//   - src/lib/codebooks.js      (FE re-export + format helpers)
//   - scripts/scrape-108.mjs    (mapovani Sreality -> LogicPro)
//   - scripts/scrape-nemovizor.mjs (mapovani Nemovizor -> LogicPro)
// =====================================================================

export const CODEBOOKS = {
  advert_function: { 1: "Prodej", 2: "Pronájem", 3: "Dražby" },
  advert_type: { 1: "Byty", 2: "Domy", 3: "Pozemky", 4: "Komerční", 5: "Ostatní" },
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
  furnished: { 1: "Ano", 2: "Ne", 3: "Částečně" },
  elevator: { 1: "Ano", 2: "Ne" },
  energy_efficiency_rating: { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G" },
  object_location: {
    1: "Centrum obce", 2: "Klidná část obce", 3: "Rušná část obce",
    4: "Okraj obce", 5: "Sídliště", 6: "Polosamota", 7: "Samota",
  },
  floor_load: {
    1: "do 3 t/m²", 2: "3–5 t/m²", 3: "5–8 t/m²", 4: "8–10 t/m²", 5: "nad 10 t/m²",
  },
  sprinkler_type: {
    1: "Bez sprinklerů", 2: "Mokrý systém", 3: "Suchý systém",
    4: "ESFR", 5: "Pěnový",
  },
  heating_type: {
    1: "Ústřední", 2: "Plynové", 3: "Elektrické", 4: "Tepelné čerpadlo",
    5: "Podlahové", 6: "VZT + rekuperace", 7: "Bez vytápění",
  },
  parking_type: {
    1: "Venkovní", 2: "Kryté", 3: "Podzemní garáž", 4: "Parkovací dům",
    5: "Kamionové stání", 6: "Bez parkování",
  },
  lease_type: {
    1: "Triple Net (NNN)", 2: "Double Net (NN)", 3: "Gross Lease",
    4: "Modified Gross", 5: "Turnover Rent",
  },
  dock_type: {
    1: "Nakládací rampa", 2: "Drive-in vrata", 3: "Cross-dock",
    4: "Nájezdová rampa", 5: "Boční nakládka",
  },
  land_type: {
    1: "Komerční", 2: "Průmyslové", 3: "Smíšené", 4: "Zemědělské",
    5: "Stavební", 6: "Brownfield", 7: "Greenfield",
  },
  utilities: {
    1: "Elektřina", 2: "Plyn", 3: "Voda", 4: "Kanalizace",
    5: "Optické připojení", 6: "Železniční vlečka", 7: "Elektřina 400V",
  },
  status: {
    active: "Aktivní",
    reserved: "Rezervováno",
    sold: "Prodáno",
    archived: "Archivováno",
    draft: "Koncept",
  },
};

// =====================================================================
// Mapovaci tabulky pro externi zdroje (Sreality, Nemovizor, ...)
// Drzime je tady, aby Nemovizor integrace mohla pridat svoji vrstvu
// bez zaduplikovani CODEBOOKS objektu.
// =====================================================================

export const SREALITY_TO_LOGICPRO = {
  // Sreality "Stav objektu" -> building_condition
  building_condition: {
    "Velmi dobrý": 1, "Dobrý": 2, "Špatný": 3, "Ve výstavbě": 4,
    "Projekt": 5, "Novostavba": 6, "K demolici": 7,
    "Před rekonstrukcí": 8, "Po rekonstrukci": 9, "V rekonstrukci": 8,
  },
  // Sreality "Stavba" -> building_type
  building_type: {
    "Dřevostavba": 1, "Dřevěná": 1, "Cihlová": 2, "Kamenná": 3,
    "Montovaná": 4, "Panelová": 5, "Skeletová": 6, "Smíšená": 7, "Ocelová": 8,
    "Železobetonová": 9, "Sendvičový panel": 10,
  },
  // Sreality "Energetická náročnost" -> energy_efficiency_rating
  energy_efficiency_rating: {
    "Mimořádně úsporná": 1, "Velmi úsporná": 2, "Úsporná": 3,
    "Méně úsporná": 4, "Nehospodárná": 5, "Velmi nehospodárná": 6,
    "Mimořádně nehospodárná": 7,
  },
  // Sreality "Topení" -> heating_type
  heating_type: {
    "Ústřední": 1, "Plynové": 2, "Elektrické": 3, "Tepelné čerpadlo": 4,
    "Podlahové": 5, "Lokální": 2,
  },
  // Sreality category_sub_cb -> LogicPro advert_subtype
  advert_subtype: {
    26: 26, 27: 27, 29: 28, 25: 25, 30: 29, 31: 30, 32: 31,
    38: 38, 46: 49, 40: 25, 41: 29, 42: 32, 18: 28, 19: 28,
  },
};

/**
 * Pomocna funkce — vrati `label` pro hodnotu z ciselniku, nebo `fallback`.
 */
export function labelFor(group, value, fallback = "Neuvedeno") {
  const dict = CODEBOOKS[group];
  if (!dict) return fallback;
  return dict[value] || fallback;
}
