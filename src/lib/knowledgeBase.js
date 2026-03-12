/* Knowledge Base – pojmy z komerčních nemovitostí
   Kategorie a definice inspirované standardní CRE terminologií */

export const KB_CATEGORIES = [
  {
    id: "obecne-terminy",
    title: "Obecné termíny",
    abbr: "OT",
    desc: "Vysvětlení obecných termínů týkajících se komerčních nemovitostí.",
    color: "#5046e5",
  },
  {
    id: "pronajem-prostor",
    title: "Pronájem prostor",
    abbr: "PP",
    desc: "Termíny, fráze a zkratky týkající se pronájmu komerčních prostor.",
    color: "#e8735a",
  },
  {
    id: "investice",
    title: "Investice",
    abbr: "IN",
    desc: "Vysvětlení pojmů ze světa realitních investic.",
    color: "#1a9a6c",
  },
  {
    id: "development",
    title: "Development",
    abbr: "DV",
    desc: "Důležité termíny a výrazy týkající se developerských projektů.",
    color: "#1e3a5f",
  },
  {
    id: "sprava-nemovitosti",
    title: "Správa nemovitostí",
    abbr: "SN",
    desc: "Specifické výrazy z oblasti správy a provozu nemovitostí.",
    color: "#7c3aed",
  },
  {
    id: "pruzkum-trhu",
    title: "Průzkum trhu",
    abbr: "PT",
    desc: "Termíny používané při průzkumu a analýze realitního trhu.",
    color: "#0f766e",
  },
];

export const KB_TERMS = [
  /* ====== OBECNÉ TERMÍNY ====== */
  { cat: "obecne-terminy", slug: "rfi", term: "RFI (Request for Information)", def: "Žádost o informace — první krok v procesu výběru dodavatele. Organizace prostřednictvím RFI shromažďuje základní údaje o schopnostech a nabídce potenciálních partnerů." },
  { cat: "obecne-terminy", slug: "drive-in", term: "Drive-in", def: "Typ přímého vjezdu do skladové nebo logistické haly, kde vozidlo zajíždí přímo k nakládacímu místu. Používá se zejména u menších jednotek a městských distribučních center." },
  { cat: "obecne-terminy", slug: "cross-dock", term: "Cross dock", def: "Logistická metoda, při které zboží přichází do skladu a téměř okamžitě se přesouvá k expedici bez dlouhodobého uskladnění. Minimalizuje náklady na skladování." },
  { cat: "obecne-terminy", slug: "hots", term: "HOTs (Heads of Terms)", def: "Dokument shrnující základní podmínky nájmu — předchůdce finální smlouvy. Obsahuje klíčové body jako výši nájemného, dobu nájmu a rozsah úprav prostor." },
  { cat: "obecne-terminy", slug: "pipeline", term: "Pipeline", def: "V kontextu průmyslového developmentu označuje plánovanou nebo připravovanou nabídku nových prostor. Zahrnuje projekty ve fázi přípravy, povolování i výstavby." },
  { cat: "obecne-terminy", slug: "adr", term: "ADR (Accord Dangereux Routier)", def: "Označení pro sklady určené k uchovávání nebezpečných látek. Vychází z Evropské dohody o mezinárodní silniční přepravě nebezpečných věcí." },
  { cat: "obecne-terminy", slug: "asti", term: "ASTI (Above Standard Tenant Improvements)", def: "Nadstandardní úpravy pronajímaných prostor nad rámec běžného vybavení. Typicky zahrnují speciální podlahové krytiny, klimatizaci či bezpečnostní systémy." },
  { cat: "obecne-terminy", slug: "e-commerce", term: "E-commerce", def: "Elektronický obchod — nákup a prodej zboží prostřednictvím internetu. V kontextu CRE je hnací silou poptávky po logistických a fulfillment centrech." },
  { cat: "obecne-terminy", slug: "early-access", term: "Early Access", def: "Období před oficiálním začátkem nájmu, během kterého má nájemce přístup do prostor za účelem přípravy, instalace vybavení nebo stavebních úprav." },
  { cat: "obecne-terminy", slug: "esfr", term: "ESFR (Early Suppression Fast Response)", def: "Pokročilý automatický sprinklerový systém navržený pro rychlou reakci při požáru v průmyslových objektech. Dokáže uhasit oheň v zárodku." },
  { cat: "obecne-terminy", slug: "fee", term: "Fee", def: "Provize nebo poplatek za zprostředkování obchodní transakce, pronájmu či poradenské služby v oblasti nemovitostí." },
  { cat: "obecne-terminy", slug: "yard", term: "Yard", def: "Zpevněná manipulační plocha před průmyslovou halou. Slouží k nakládce, vykládce a manévrování nákladních vozidel." },
  { cat: "obecne-terminy", slug: "rfp", term: "RFP (Request for Proposal)", def: "Výzva k podání nabídky — dokument shrnující požadavky zadavatele na dodání služby nebo produktu. Detailnější než RFI." },
  { cat: "obecne-terminy", slug: "svetlik", term: "Světlík", def: "Střešní okno propouštějící denní světlo do interiéru průmyslové haly. Zlepšuje pracovní podmínky a snižuje náklady na osvětlení." },
  { cat: "obecne-terminy", slug: "spekulativni-vystavba", term: "Spekulativní výstavba", def: "Výstavba komerční budovy bez předem zajištěného nájemce. Developer staví na vlastní riziko s očekáváním budoucí poptávky." },
  { cat: "obecne-terminy", slug: "breeam", term: "BREEAM", def: "Mezinárodní certifikační systém hodnotící environmentální kvalitu budov. Posuzuje energetickou náročnost, materiály, dopravu a ekologii." },
  { cat: "obecne-terminy", slug: "handover", term: "Handover", def: "Oficiální předání budovy nebo prostor — moment přechodu kontroly z developera/pronajímatele na nájemce či kupujícího." },
  { cat: "obecne-terminy", slug: "rfq", term: "RFQ (Request for Quotation)", def: "Žádost o cenovou nabídku — standardní obchodní proces vyžadující konkrétní cenové kalkulace od dodavatelů." },
  { cat: "obecne-terminy", slug: "cctv", term: "CCTV (Closed-circuit Television)", def: "Kamerový bezpečnostní systém s uzavřeným okruhem. Standardní vybavení průmyslových parků, skladů a administrativních budov." },

  /* ====== PRONÁJEM PROSTOR ====== */
  { cat: "pronajem-prostor", slug: "fla", term: "FLA (Future Lease Agreement)", def: "Smlouva o budoucím nájmu — závazek obou stran uzavřít nájemní smlouvu po dokončení výstavby nebo úprav prostor." },
  { cat: "pronajem-prostor", slug: "landlord", term: "Landlord (Pronajímatel)", def: "Vlastník nemovitosti, který ji poskytuje k užívání nájemcům za úplatu. Zodpovídá za údržbu společných prostor a konstrukce budovy." },
  { cat: "pronajem-prostor", slug: "parkovaci-pomer", term: "Parkovací poměr", def: "Urbanistický ukazatel určující počet parkovacích míst na danou plochu (např. 1:50 m² znamená jedno stání na každých 50 m² kanceláře)." },
  { cat: "pronajem-prostor", slug: "shell-core", term: "Shell & Core", def: "Stav budovy obsahující pouze nosnou konstrukci, obvodový plášť a základní rozvody. Nájemce si interiér dokončuje sám dle svých potřeb." },
  { cat: "pronajem-prostor", slug: "fit-out", term: "Fit-out", def: "Proces kompletního dokončení interiéru podle specifikací nájemce — od příček a podlah po osvětlení a nábytek." },
  { cat: "pronajem-prostor", slug: "lease-term", term: "Lease Term", def: "Doba trvání nájmu — období platnosti nájemní smlouvy. U komerčních nemovitostí typicky 3–10 let." },
  { cat: "pronajem-prostor", slug: "indexace", term: "Indexace", def: "Mechanismus automatické úpravy nájemného podle inflačního indexu (typicky CPI nebo HICP). Chrání pronajímatele před znehodnocením příjmu." },
  { cat: "pronajem-prostor", slug: "holdover-tenant", term: "Holdover Tenant", def: "Nájemce, který zůstává v prostorech po vypršení nájemní smlouvy. Právní režim závisí na jurisdikci a podmínkách smlouvy." },
  { cat: "pronajem-prostor", slug: "gla-nla", term: "GLA vs NLA", def: "GLA (Gross Leasable Area) = hrubá pronajímatelná plocha včetně podílu na společných prostorech. NLA (Net Leasable Area) = čistá plocha pouze pro nájemce." },
  { cat: "pronajem-prostor", slug: "reinstatement", term: "Reinstatement", def: "Povinnost nájemce uvést prostor do původního stavu při ukončení nájmu. Zahrnuje odstranění úprav a navrácení standardního vybavení." },
  { cat: "pronajem-prostor", slug: "vystehovani", term: "Vystěhování (Eviction)", def: "Právní proces nucení nájemce k opuštění prostor, obvykle kvůli neplnění podmínek smlouvy nebo neplacení nájemného." },
  { cat: "pronajem-prostor", slug: "pravo-prvniho-odmitnuti", term: "Právo prvního odmítnutí", def: "Smluvní právo nájemce na přednostní nabídku při prodeji nebo pronájmu dalších prostor v budově, před nabídnutím třetím stranám." },
  { cat: "pronajem-prostor", slug: "option-to-renew", term: "Option to Renew", def: "Smluvní právo nájemce prodloužit nájem za předem dohodnutých podmínek. Aktivuje se písemným oznámením v definovaném předstihu." },
  { cat: "pronajem-prostor", slug: "market-rent", term: "Market Rent (Tržní nájemné)", def: "Obvyklá výše nájemného pro daný typ nemovitosti a lokalitu na základě aktuální nabídky a poptávky na trhu." },
  { cat: "pronajem-prostor", slug: "tenant-mix", term: "Tenant Mix", def: "Strategická kombinace různých typů nájemců v jednom komerčním projektu. Cílem je synergický efekt a maximalizace návštěvnosti." },
  { cat: "pronajem-prostor", slug: "efektivni-najem", term: "Efektivní nájem", def: "Skutečná výše nájemného po zohlednění všech slev, pobídek a nájemních prázdnin. Přesnější ukazatel než headline rent." },
  { cat: "pronajem-prostor", slug: "tenant", term: "Tenant (Nájemník)", def: "Osoba nebo společnost užívající pronajatý prostor na základě nájemní smlouvy. Platí nájemné a dodržuje podmínky smlouvy." },
  { cat: "pronajem-prostor", slug: "add-on-factor", term: "Add-on Factor", def: "Koeficient vyjadřující poměr společných prostor k pronajímatelné ploše. Používá se pro výpočet celkového nájmu v kancelářských budovách." },
  { cat: "pronajem-prostor", slug: "space-plan", term: "Space Plan", def: "Plánek rozložení interiéru podle specifických potřeb nájemce — pozice kanceláří, zasedaček, kuchyňky a technického zázemí." },
  { cat: "pronajem-prostor", slug: "najemni-prazdniny", term: "Nájemní prázdniny (Rent Free)", def: "Období, během kterého nájemce neplatí nájemné. Typicky se poskytuje na začátku nájmu jako pobídka nebo kompenzace za fit-out." },
  { cat: "pronajem-prostor", slug: "pre-leasing", term: "Pre-leasing", def: "Uzavírání nájemních smluv na prostory, které jsou teprve ve výstavbě. Snižuje riziko developera a umožňuje přizpůsobení prostor." },
  { cat: "pronajem-prostor", slug: "kauce", term: "Kauce", def: "Finanční záloha (typicky 3–6 měsíčních nájmů) skládaná nájemcem jako zajištění proti škodám nebo neplacení nájemného." },

  /* ====== INVESTICE ====== */
  { cat: "investice", slug: "net-yield", term: "Net Yield (Čistý výnos)", def: "Procentuální výnos nemovitosti po odečtení provozních nákladů. Přesnější ukazatel skutečné návratnosti investice než gross yield." },
  { cat: "investice", slug: "cap-rate", term: "Míra kapitalizace (Cap Rate)", def: "Poměr ročního čistého provozního příjmu k pořizovací ceně nemovitosti. Základní metrika pro srovnání investičních příležitostí." },
  { cat: "investice", slug: "irr", term: "IRR (Internal Rate of Return)", def: "Vnitřní míra návratnosti — diskontní sazba, při které se čistá současná hodnota budoucích peněžních toků rovná nule. Měří celkovou výkonnost investice." },
  { cat: "investice", slug: "dan-z-nemovitosti", term: "Daň z nemovitosti", def: "Majetková daň odváděná vlastníkem nemovitosti. Výše závisí na typu, rozloze a lokalitě nemovitosti dle místních předpisů." },
  { cat: "investice", slug: "noi", term: "NOI (Net Operating Income)", def: "Čistý provozní příjem — součet všech příjmů z nemovitosti po odečtení provozních nákladů, ale před odpočtem daní a splátek úvěru." },
  { cat: "investice", slug: "cap", term: "CAP", def: "Zkratka pro kapitalizační sazbu (Cap Rate) nebo horní limit v kontextu operativních nákladů komerčních nemovitostí." },
  { cat: "investice", slug: "gross-yield", term: "Gross Yield (Hrubý výnos)", def: "Celkový roční příjem z nájmu vyjádřený jako procento z pořizovací nebo tržní hodnoty nemovitosti. Nezohledňuje provozní náklady." },
  { cat: "investice", slug: "sale-leaseback", term: "Sale-Leaseback", def: "Transakce, při které vlastník nemovitost prodá a současně si ji pronajme zpět. Uvolní kapitál vázaný v nemovitosti při zachování užívání." },
  { cat: "investice", slug: "triple-net-lease", term: "Triple Net Lease (NNN)", def: "Nájemní smlouva, kde nájemce platí kromě nájmu i daň z nemovitosti, pojištění a údržbu. Minimalizuje náklady pronajímatele." },
  { cat: "investice", slug: "komercni-pozemek", term: "Komerční pozemek", def: "Pozemek určený územním plánem pro komerční výstavbu — kanceláře, obchody, průmysl. Hodnota závisí na lokalitě a technické infrastruktuře." },
  { cat: "investice", slug: "due-diligence", term: "Due Diligence", def: "Důkladná analýza rizik prováděná před akvizicí nemovitosti. Zahrnuje právní, technický, finanční a environmentální audit." },

  /* ====== DEVELOPMENT ====== */
  { cat: "development", slug: "rekolaudace", term: "Rekolaudace", def: "Úřední proces při zásadní změně v užívání, konstrukci nebo vybavení stavby po původní kolaudaci. Vyžaduje nové povolení stavebního úřadu." },
  { cat: "development", slug: "stavebni-povoleni", term: "Stavební povolení (SP)", def: "Oficiální dokument vydaný stavebním úřadem opravňující k provedení stavby. Podmínkou je soulad s územním plánem a platnými předpisy." },
  { cat: "development", slug: "uzemni-rozhodnuti", term: "Územní rozhodnutí (ÚR)", def: "Právní akt vydaný na základě územního řízení, který stanoví podmínky pro umístění stavby v konkrétním území." },
  { cat: "development", slug: "kolaudace", term: "Kolaudace", def: "Závěrečná kontrola dokončené stavby stavebním úřadem. Ověřuje soulad s projektem, stavebním povolením a bezpečnostními normami." },
  { cat: "development", slug: "pudni-bonita", term: "Půdní bonita", def: "Ukazatel kvality a úrodnosti půdy na daném území. Ovlivňuje možnost vynětí ze zemědělského půdního fondu a cenu pozemku." },
  { cat: "development", slug: "sea", term: "SEA (Strategic Environmental Assessment)", def: "Strategické posouzení vlivů koncepcí a plánů na životní prostředí. Hodnotí se před zahájením konkrétních projektů." },
  { cat: "development", slug: "uzemni-plan", term: "Územní plán (ÚP)", def: "Strategický dokument obce stanovující funkční využití území — kde lze stavět, jaký typ zástavby je přípustný a jaké jsou limity." },
  { cat: "development", slug: "eia", term: "EIA (Environmental Impact Assessment)", def: "Proces hodnocení dopadů navrhovaného projektu na životní prostředí. Povinný u větších staveb a průmyslových záměrů." },

  /* ====== SPRÁVA NEMOVITOSTÍ ====== */
  { cat: "sprava-nemovitosti", slug: "facility-management", term: "Facility Management", def: "Technická správa nemovitostí — obor zaměřený na efektivní provoz, údržbu a optimalizaci budov a jejich technického vybavení." },
  { cat: "sprava-nemovitosti", slug: "hruby-vs-efektivni-najem", term: "Hrubý vs. Efektivní nájem", def: "Hrubý nájem = částka uvedená ve smlouvě. Efektivní nájem = skutečná platba po započtení slev, pobídek a nájemních prázdnin." },
  { cat: "sprava-nemovitosti", slug: "property-management", term: "Property Management", def: "Komerční správa nemovitostí — služba zahrnující každodenní provoz, údržbu, pronájem a optimalizaci výnosů z nemovitosti." },
  { cat: "sprava-nemovitosti", slug: "asset-management", term: "Asset Management", def: "Strategická správa nemovitostního portfolia s cílem maximalizovat hodnotu a výnosy pro vlastníka. Zahrnuje investiční rozhodování." },
  { cat: "sprava-nemovitosti", slug: "tenancy-schedule", term: "Tenancy Schedule", def: "Přehledný dokument se seznamem všech nájemců v budově, jejich pronajatými plochami, podmínkami nájmu a platebními údaji." },
  { cat: "sprava-nemovitosti", slug: "pobidky", term: "Pobídky / Příspěvky", def: "Výhody nabízené nájemci pronajímatelem k uzavření smlouvy — nájemní prázdniny, příspěvek na fit-out, snížené nájemné v úvodním období." },
  { cat: "sprava-nemovitosti", slug: "capex", term: "CAPEX (Capital Expenditure)", def: "Kapitálové výdaje investované do nemovitosti, které zvyšují její hodnotu — rekonstrukce, modernizace, nové technologie." },
  { cat: "sprava-nemovitosti", slug: "marex", term: "MAREX (Marketing Expenditure)", def: "Marketingové náklady na propagaci nemovitosti — reklama, vizualizace, brokerage materiály, eventy pro nájemce." },
  { cat: "sprava-nemovitosti", slug: "turnover", term: "Turnover (Obratové nájemné)", def: "Složka nájemného odvozená od obratu nájemce. Typické pro retailové prostory — pronajímatel participuje na úspěchu obchodu." },
  { cat: "sprava-nemovitosti", slug: "service-charges", term: "Service Charges (SCH)", def: "Poplatky za služby spojené s provozem nemovitosti — úklid, ostraha, údržba společných prostor, pojištění budovy." },
  { cat: "sprava-nemovitosti", slug: "footfall", term: "Footfall", def: "Měření návštěvnosti — počet lidí procházejících obchodním centrem nebo retailovým prostorem za určité období." },
  { cat: "sprava-nemovitosti", slug: "rent-roll", term: "Rent Roll", def: "Detailní seznam všech nájemních jednotek s informacemi o nájemcích, smluvních podmínkách, platbách a expiraci smluv." },
  { cat: "sprava-nemovitosti", slug: "opex", term: "OPEX (Operating Expenses)", def: "Provozní výdaje na každodenní chod nemovitosti — energie, údržba, správa, pojištění, úklid a bezpečnost." },

  /* ====== PRŮZKUM TRHU ====== */
  { cat: "pruzkum-trhu", slug: "vacancy-rate", term: "Vacancy Rate", def: "Míra neobsazenosti — procento volných prostor z celkového objemu dokončených nemovitostí na trhu. Klíčový indikátor zdraví trhu." },
  { cat: "pruzkum-trhu", slug: "trzni-hodnota", term: "Tržní hodnota", def: "Odhadovaná cena, za kterou by nemovitost mohla být prodána na otevřeném trhu mezi informovanými a nezávislými stranami." },
  { cat: "pruzkum-trhu", slug: "heatmap", term: "Heatmap", def: "Dvourozměrné zobrazení dat pomocí barevné škály. V CRE slouží k vizualizaci nájemného, obsazenosti nebo poptávky podle lokality." },
  { cat: "pruzkum-trhu", slug: "analyza-trhu", term: "Analýza trhu", def: "Systematický proces sběru, zpracování a interpretace dat o nemovitostním trhu — nabídka, poptávka, ceny, trendy a prognózy." },
  { cat: "pruzkum-trhu", slug: "gross-take-up", term: "GROSS Take-up", def: "Celkový objem pronajatých prostor za dané období včetně renegociací a prodloužení stávajících smluv." },
  { cat: "pruzkum-trhu", slug: "prostory-tridy-a", term: "Prostory třídy A", def: "Nejvyšší standard komerčních prostor — moderní konstrukce, prémiová lokalita, špičkové technické vybavení a certifikace." },
  { cat: "pruzkum-trhu", slug: "net-take-up", term: "NET Take-up", def: "Čistý objem nově pronajatých prostor za dané období — pouze nové smlouvy bez renegociací. Ukazatel skutečné absorpce trhu." },
];

/** Najde kategorii dle ID */
export function getCategoryById(id) {
  return KB_CATEGORIES.find((c) => c.id === id);
}

/** Vrátí pojmy pro danou kategorii */
export function getTermsByCategory(catId) {
  return KB_TERMS.filter((t) => t.cat === catId);
}

/** Najde konkrétní pojem dle slugu */
export function getTermBySlug(slug) {
  return KB_TERMS.find((t) => t.slug === slug);
}

/** Vyhledávání pojmů (term + def) */
export function searchTerms(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return KB_TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
  );
}
