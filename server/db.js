import Database from "better-sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "logicpro.db");

let db;

export function getDb() {
  if (!db) {
    const fresh = !existsSync(DB_PATH);
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    if (fresh) initDb();
  }
  return db;
}

/* ── Codebooks (Sreality standard) ── */

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
  extra_info: { 1: "Rezervováno", 2: "Prodáno" },
};

/* ── Schema + Seed ── */

function initDb() {
  console.log("[DB] Creating database and seeding data...");

  db.exec(`
    CREATE TABLE listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      advert_function INTEGER NOT NULL,
      advert_type INTEGER NOT NULL DEFAULT 4,
      advert_subtype INTEGER NOT NULL,
      advert_price REAL NOT NULL,
      advert_price_currency INTEGER NOT NULL DEFAULT 3,
      advert_price_unit INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      locality_city TEXT NOT NULL,
      locality_street TEXT,
      locality_citypart TEXT,
      locality_region TEXT,
      locality_latitude REAL,
      locality_longitude REAL,
      usable_area INTEGER,
      estate_area INTEGER,
      office_area INTEGER,
      min_divisible_area INTEGER,
      building_condition INTEGER,
      building_type INTEGER,
      building_class INTEGER,
      certification INTEGER,
      furnished INTEGER,
      elevator INTEGER,
      parking_lots INTEGER DEFAULT 0,
      parking_type INTEGER,
      garage INTEGER DEFAULT 0,
      energy_efficiency_rating INTEGER,
      floors INTEGER,
      ceiling_height REAL,
      floor_load INTEGER,
      sprinkler_type INTEGER,
      heating_type INTEGER,
      loading_docks INTEGER DEFAULT 0,
      dock_type INTEGER,
      drive_in_gates INTEGER DEFAULT 0,
      crane_capacity REAL,
      column_grid TEXT,
      lease_type INTEGER,
      available_from TEXT,
      land_type INTEGER,
      utilities TEXT,
      rail_access INTEGER DEFAULT 0,
      highway_distance REAL,
      year_built INTEGER,
      year_renovated INTEGER,
      extra_info INTEGER,
      features TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE listing_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL REFERENCES listings(id),
      url TEXT NOT NULL,
      alt TEXT,
      is_main INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );
    CREATE INDEX idx_listings_function ON listings(advert_function);
    CREATE INDEX idx_listings_subtype ON listings(advert_subtype);
    CREATE INDEX idx_listings_city ON listings(locality_city);
    CREATE INDEX idx_images_listing ON listing_images(listing_id);
  `);

  seedData();
  console.log("[DB] Done. Seeded 18 listings into logicpro.db");
}

function seedData() {
  const listings = [
    { title:"Logistický park Praha-Východ", advert_function:2, advert_subtype:26, advert_price:4.50, advert_price_currency:3, advert_price_unit:4, description:"Moderní logistický park v strategické lokalitě Praha-Východ nabízí špičkové skladové a distribuční prostory třídy A. Areál je ideální pro e-commerce, logistiku a lehkou výrobu.\n\nVýborné napojení na dálnici D1 a Pražský okruh zajišťuje rychlou dostupnost do centra Prahy i na hlavní dopravní tahy. K dispozici jsou flexibilní jednotky od 2 000 m² s možností rozšíření.\n\nAreál disponuje moderní infrastrukturou včetně LED osvětlení, sprinklerového systému, nakládacích ramp a dostatečného parkování pro osobní i nákladní automobily.", locality_city:"Praha", locality_citypart:"Praha-Východ", locality_region:"Středočeský kraj", locality_latitude:50.0555, locality_longitude:14.6125, usable_area:12500, building_condition:6, building_type:6, elevator:2, parking_lots:1, garage:0, energy_efficiency_rating:2, floors:1, ceiling_height:12.0, office_area:800, min_divisible_area:2000, building_class:1, certification:2, parking_type:5, floor_load:3, sprinkler_type:4, heating_type:7, loading_docks:24, dock_type:1, drive_in_gates:4, column_grid:"12x24 m", lease_type:1, available_from:"2026-05-01", highway_distance:1.2, rail_access:0, year_built:2022, features:JSON.stringify(["LED osvětlení","Sprinklerový systém","Nakládací rampy","Podlahová nosnost 5 t/m²","BREEAM certifikace","Parking pro kamiony","24/7 ostraha a CCTV","Kancelářské zázemí","Světlá výška 12 m","Napojení na D1"]) },
    { title:"Kancelářský komplex Brno", advert_function:1, advert_subtype:25, advert_price:45000000, advert_price_currency:1, advert_price_unit:1, description:"Reprezentativní kancelářský komplex v centru Brna nabízí moderní prostory třídy A s výbornou dopravní dostupností. Budova prošla kompletní rekonstrukcí v roce 2021.\n\nObjekt disponuje 3 200 m² kancelářských ploch rozložených na 5 nadzemních podlažích s panoramatickým výhledem na město. Součástí je podzemní parkování pro 45 vozidel.", locality_city:"Brno", locality_citypart:"Brno-střed", locality_region:"Jihomoravský kraj", locality_latitude:49.1951, locality_longitude:16.6068, usable_area:3200, building_condition:9, building_type:6, elevator:1, parking_lots:1, garage:1, energy_efficiency_rating:2, floors:5, ceiling_height:3.2, building_class:1, certification:3, parking_type:3, lease_type:4, heating_type:4, year_built:2005, year_renovated:2021, features:JSON.stringify(["Klimatizace","Podzemní parking 45 míst","Recepce","Optické připojení","Serverovna","Zasedací místnosti","Kuchyňky na patře","Bezpečnostní systém"]) },
    { title:"Výrobní hala Ostrava", advert_function:2, advert_subtype:27, advert_price:3.80, advert_price_currency:3, advert_price_unit:4, description:"Prostorná výrobní hala v průmyslové zóně Ostrava-Hrabová s vynikající dopravní dostupností. Hala je vhodná pro lehkou i středně těžkou výrobu, montáž a kompletaci.\n\nSoučástí areálu je kancelářské zázemí, sociální zařízení a zpevněná manipulační plocha. Napojení na silnici I/56 a blízkost dálnice D1.", locality_city:"Ostrava", locality_citypart:"Hrabová", locality_region:"Moravskoslezský kraj", locality_latitude:49.7780, locality_longitude:18.2738, usable_area:8000, building_condition:2, building_type:6, elevator:2, parking_lots:1, garage:0, energy_efficiency_rating:4, floors:1, ceiling_height:8.5, building_class:2, office_area:400, floor_load:2, crane_capacity:10.0, column_grid:"18x12 m", sprinkler_type:2, heating_type:2, parking_type:1, highway_distance:3.5, year_built:2008, features:JSON.stringify(["Mostový jeřáb 10t","Podlahová nosnost 3 t/m²","Přípojka 400V","Sociální zázemí","Kancelářská část","Manipulační plocha","Oplocený areál","Vrátnice"]) },
    { title:"Skladový areál Plzeň", advert_function:2, advert_subtype:26, advert_price:3.90, advert_price_currency:3, advert_price_unit:4, description:"Rozsáhlý skladový areál na okraji Plzně s přímým napojením na dálnici D5 směr Praha/Německo. Areál nabízí moderní skladové prostory s možností dělení od 3 000 m².\n\nStrategická poloha na logistickém koridoru mezi Prahou a Bavorskem činí tento areál ideálním pro distribuci a cross-docking.", locality_city:"Plzeň", locality_citypart:"Plzeň-Bory", locality_region:"Plzeňský kraj", locality_latitude:49.7384, locality_longitude:13.3176, usable_area:15000, building_condition:6, building_type:6, elevator:2, parking_lots:1, garage:0, energy_efficiency_rating:3, floors:1, ceiling_height:10.0, office_area:600, min_divisible_area:3000, building_class:1, certification:4, parking_type:5, floor_load:3, sprinkler_type:2, heating_type:7, loading_docks:18, dock_type:3, drive_in_gates:2, column_grid:"12x24 m", lease_type:1, available_from:"2026-04-01", highway_distance:0.8, rail_access:0, year_built:2020, features:JSON.stringify(["Nakládací rampy","LED osvětlení","Sprinklery","Cross-docking","Parkoviště kamionů","Ostraha 24/7","Kancelářská část","Napojení na D5"]) },
    { title:"A-class kanceláře Praha 4", advert_function:2, advert_subtype:25, advert_price:16.50, advert_price_currency:3, advert_price_unit:4, description:"Prémiové kancelářské prostory v nově postaveném business parku v Praze 4 – Pankrác. Prostory nabízejí open-space i uzavřené kanceláře s flexibilním uspořádáním.\n\nBudova certifikována LEED Gold, s pokročilým systémem vzduchotechniky a řízení spotřeby energie. Přímé napojení na metro C – stanice Pankrác.", locality_city:"Praha", locality_citypart:"Praha 4 – Pankrác", locality_region:"Hlavní město Praha", locality_latitude:50.0587, locality_longitude:14.4380, usable_area:1800, building_condition:6, building_type:6, elevator:1, parking_lots:1, garage:1, energy_efficiency_rating:1, floors:8, ceiling_height:3.0, building_class:1, certification:7, parking_type:3, lease_type:1, heating_type:4, year_built:2023, features:JSON.stringify(["LEED Gold","Metro C – Pankrác","Podzemní parking","Recepce 24/7","Klimatizace","Optické připojení","Terasa na střeše","Kavárna v přízemí"]) },
    { title:"Stavební pozemek Brno-jih", advert_function:1, advert_subtype:28, advert_price:28000000, advert_price_currency:1, advert_price_unit:1, description:"Komerční stavební pozemek v rozvíjející se lokalitě Brno-jih, vhodný pro výstavbu obchodního centra, showroomu nebo logistického objektu.\n\nPozemek je rovinatý, zasíťovaný (elektřina, voda, plyn, kanalizace) s platným územním plánem pro komerční zástavbu. Přímý přístup z hlavní komunikace.", locality_city:"Brno", locality_citypart:"Brno-jih", locality_region:"Jihomoravský kraj", locality_latitude:49.1600, locality_longitude:16.6300, estate_area:22000, land_type:1, utilities:JSON.stringify([1,2,3,4]), highway_distance:2.5, features:JSON.stringify(["Rovinatý terén","Kompletní inženýrské sítě","ÚP pro komerční zástavbu","Přístup z hlavní komunikace","Napojení na D1","Bez ekologické zátěže"]) },
    { title:"Distribuční centrum Ostrava", advert_function:2, advert_subtype:26, advert_price:4.20, advert_price_currency:3, advert_price_unit:4, description:"Moderní distribuční centrum v průmyslové zóně Mošnov u Letiště Leoše Janáčka. Objekt třídy A splňuje nejvyšší standardy pro logistiku a e-commerce.\n\nAreál nabízí výbornou dopravní infrastrukturu včetně blízkosti dálnice D1, železniční vlečky a mezinárodního letiště.", locality_city:"Ostrava", locality_citypart:"Mošnov", locality_region:"Moravskoslezský kraj", locality_latitude:49.6961, locality_longitude:18.1125, usable_area:20000, building_condition:6, building_type:6, elevator:2, parking_lots:1, garage:0, energy_efficiency_rating:2, floors:1, ceiling_height:12.0, office_area:1200, min_divisible_area:5000, building_class:1, certification:2, parking_type:5, floor_load:3, sprinkler_type:4, heating_type:6, loading_docks:46, dock_type:1, drive_in_gates:6, column_grid:"12x24 m", lease_type:1, available_from:"2026-06-01", highway_distance:2.0, rail_access:1, year_built:2021, features:JSON.stringify(["Třída A","Sprinklery ESFR","LED osvětlení","46 nakládacích doků","Manipulační dvůr","Železniční vlečka","Blízkost letiště","BREEAM Excellent"]) },
    { title:"Kancelářský prostor Praha 1", advert_function:2, advert_subtype:25, advert_price:22.00, advert_price_currency:3, advert_price_unit:4, description:"Exkluzivní kancelářské prostory v historické budově na Novém Městě v Praze 1. Prostory kombinují klasickou architekturu se současným interiérovým designem.\n\nKanceláře jsou plně vybavené, klimatizované, s vysokými stropy a velkými okny. Ideální pro advokátní kanceláře, finanční služby a prestižní zastoupení.", locality_city:"Praha", locality_citypart:"Praha 1 – Nové Město", locality_region:"Hlavní město Praha", locality_latitude:50.0815, locality_longitude:14.4264, usable_area:450, building_condition:9, building_type:3, elevator:1, parking_lots:0, garage:0, energy_efficiency_rating:4, floors:4, ceiling_height:3.8, furnished:1, building_class:1, parking_type:6, lease_type:3, heating_type:1, year_built:1905, year_renovated:2019, features:JSON.stringify(["Historická budova","Klimatizace","Vysoké stropy 3,8 m","Plně vybavené","Recepční služby","Zasedací místnost","Kuchyňka","Optický internet"]) },
    { title:"Výrobní areál Plzeň", advert_function:1, advert_subtype:27, advert_price:35000000, advert_price_currency:1, advert_price_unit:1, description:"Kompletní výrobní areál v Plzni se dvěma výrobními halami, administrativní budovou a rozsáhlým pozemkem. Vhodné pro strojírenskou výrobu, automotive nebo potravinářství.\n\nAreál prošel částečnou modernizací v roce 2020. Výrobní haly jsou vybaveny mostovými jeřáby a kompresory.", locality_city:"Plzeň", locality_citypart:"Plzeň-Skvrňany", locality_region:"Plzeňský kraj", locality_latitude:49.7470, locality_longitude:13.3540, usable_area:5500, estate_area:12000, building_condition:9, building_type:6, elevator:2, parking_lots:1, garage:1, energy_efficiency_rating:4, floors:2, ceiling_height:7.5, building_class:2, office_area:650, floor_load:4, crane_capacity:20.0, column_grid:"18x18 m", sprinkler_type:2, heating_type:2, parking_type:1, highway_distance:5.0, year_built:1998, year_renovated:2020, features:JSON.stringify(["2 výrobní haly","Mostový jeřáb 20t","Administrativní budova","Kompresorovna","Trafostanice","Oplocený areál","Vrátnice","Pozemek 12 000 m²"]) },
    { title:"Pozemek Praha-západ", advert_function:1, advert_subtype:28, advert_price:52000000, advert_price_currency:1, advert_price_unit:1, description:"Rozsáhlý komerční pozemek v atraktivní lokalitě Praha-západ, vhodný pro výstavbu retailového parku, showroomů nebo mixed-use projektu.\n\nPozemek s regulérním tvarem a minimálním převýšením, kompletně zasíťovaný. Územní plán umožňuje komerční a obchodní zástavbu.", locality_city:"Praha", locality_citypart:"Praha-západ", locality_region:"Středočeský kraj", locality_latitude:50.0300, locality_longitude:14.2800, estate_area:18000, land_type:1, utilities:JSON.stringify([1,2,3,4,5]), highway_distance:1.5, features:JSON.stringify(["Rovinatý pozemek","Kompletní sítě","ÚP pro komerci","Blízkost Pražského okruhu","Bez zátěže","Pravidelný tvar"]) },
    { title:"Logistický hub Brno", advert_function:2, advert_subtype:26, advert_price:4.10, advert_price_currency:3, advert_price_unit:4, description:"Strategicky umístěný logistický hub na křižovatce dálnic D1 a D2 v Brně. Objekt nabízí skladové prostory třídy A s možností build-to-suit.\n\nIdeální pozice pro distribuci po celé Moravě a do střední Evropy. V blízkosti letiště Brno-Tuřany.", locality_city:"Brno", locality_citypart:"Brno-Slatina", locality_region:"Jihomoravský kraj", locality_latitude:49.1700, locality_longitude:16.7000, usable_area:10000, building_condition:6, building_type:6, elevator:2, parking_lots:1, garage:0, energy_efficiency_rating:2, floors:1, ceiling_height:11.0, office_area:500, min_divisible_area:2500, building_class:1, certification:3, parking_type:5, floor_load:3, sprinkler_type:2, heating_type:6, loading_docks:20, dock_type:1, drive_in_gates:3, column_grid:"12x24 m", lease_type:1, available_from:"2026-07-01", highway_distance:0.5, rail_access:0, year_built:2019, features:JSON.stringify(["Třída A","Křižovatka D1/D2","Nakládací doky","LED osvětlení","Sprinklery","Build-to-suit možnost","Blízkost letiště","Kancelářské zázemí"]) },
    { title:"Flex kanceláře Ostrava", advert_function:2, advert_subtype:25, advert_price:12.00, advert_price_currency:3, advert_price_unit:4, description:"Moderní flexibilní kanceláře v nově zrekonstruované budově v centru Ostravy. Prostory jsou připraveny k okamžitému nastěhování s možností krátkodobého i dlouhodobého pronájmu.\n\nBudova nabízí coworkingové zázemí, zasedací místnosti a společné prostory. Výborná dostupnost MHD.", locality_city:"Ostrava", locality_citypart:"Moravská Ostrava", locality_region:"Moravskoslezský kraj", locality_latitude:49.8345, locality_longitude:18.2920, usable_area:600, building_condition:9, building_type:2, elevator:1, parking_lots:1, garage:0, energy_efficiency_rating:3, floors:3, ceiling_height:3.0, furnished:1, building_class:2, parking_type:2, lease_type:4, heating_type:1, year_built:1975, year_renovated:2023, features:JSON.stringify(["Plně vybavené","Coworking","Zasedací místnosti","Kuchyňka","Klimatizace","Optický internet","Recepce","MHD u budovy"]) },
    { title:"Obchodní prostory Praha-Vinohrady", advert_function:2, advert_subtype:28, advert_price:18.00, advert_price_currency:3, advert_price_unit:4, description:"Atraktivní obchodní prostory v přízemí činžovního domu na frekventované ulici Vinohradské třídy. Prostory vhodné pro showroom, butik, kavárnu nebo kancelář s klientským zázemím.\n\nVelká výloha zajišťuje výbornou viditelnost. Prostory je možné upravit dle požadavků nájemce.", locality_city:"Praha", locality_citypart:"Praha 2 – Vinohrady", locality_region:"Hlavní město Praha", locality_latitude:50.0754, locality_longitude:14.4430, usable_area:280, building_condition:9, building_type:2, elevator:2, parking_lots:0, garage:0, energy_efficiency_rating:4, floors:1, ceiling_height:4.2, parking_type:6, heating_type:1, year_built:1910, year_renovated:2020, features:JSON.stringify(["Výloha na ulici","Frekventovaná lokace","Metro A – Náměstí Míru","Úprava dle nájemce","Sociální zázemí","Bezbariérový přístup"]) },
    { title:"Restaurace & bar Brno-centrum", advert_function:2, advert_subtype:30, advert_price:85000, advert_price_currency:1, advert_price_unit:2, description:"Plně vybavená restaurace s barem v centru Brna na náměstí Svobody. Prostory zahrnují hlavní sál pro 80 hostů, bar, kuchyni a letní zahrádku.\n\nNemovitost je vhodná pro restauraci, café-bar nebo event space. Kompletní gastro vybavení součástí pronájmu.", locality_city:"Brno", locality_citypart:"Brno-střed", locality_region:"Jihomoravský kraj", locality_latitude:49.1953, locality_longitude:16.6080, usable_area:350, building_condition:1, building_type:2, elevator:2, parking_lots:0, garage:0, energy_efficiency_rating:4, floors:1, ceiling_height:3.5, furnished:1, parking_type:6, heating_type:1, year_built:1890, year_renovated:2018, features:JSON.stringify(["Kapacita 80 hostů","Profesionální kuchyně","Bar","Letní zahrádka","Klimatizace","Gastro vybavení v ceně","WC pro hosty","Centrum města"]) },
    { title:"Činžovní dům Praha-Žižkov", advert_function:1, advert_subtype:38, advert_price:78000000, advert_price_currency:1, advert_price_unit:1, description:"Činžovní dům v žádané lokalitě Prahy 3 – Žižkov s 12 bytovými jednotkami a 2 komerčními prostory v přízemí. Dům je v dobrém stavu s potenciálem dalšího zhodnocení.\n\nVšechny byty jsou pronajaty s celkovým měsíčním výnosem 380 000 CZK. Výnos 5,8 % p.a.", locality_city:"Praha", locality_citypart:"Praha 3 – Žižkov", locality_region:"Hlavní město Praha", locality_latitude:50.0900, locality_longitude:14.4500, usable_area:1200, building_condition:2, building_type:2, elevator:2, parking_lots:0, garage:0, energy_efficiency_rating:5, floors:5, ceiling_height:3.2, parking_type:6, heating_type:1, year_built:1925, features:JSON.stringify(["12 bytových jednotek","2 komerční prostory","Výnos 5,8 % p.a.","Plně pronajato","Dobrý stav","Potenciál rekonstrukce","Metro A – Flora","Klidná ulice"]) },
    { title:"Hotel Plzeň-centrum", advert_function:1, advert_subtype:29, advert_price:62000000, advert_price_currency:1, advert_price_unit:1, description:"Tříhvězdičkový hotel v historickém centru Plzně s 45 pokoji, restaurací a konferenčním sálem. Hotel je v provozu s ustálenou klientelou.\n\nBudova prošla rekonstrukcí v roce 2018. Součástí je podzemní garáž pro 20 vozidel a zahrádka.", locality_city:"Plzeň", locality_citypart:"Plzeň-centrum", locality_region:"Plzeňský kraj", locality_latitude:49.7476, locality_longitude:13.3776, usable_area:2800, building_condition:9, building_type:2, elevator:1, parking_lots:1, garage:1, energy_efficiency_rating:3, floors:4, ceiling_height:3.0, furnished:1, parking_type:3, heating_type:1, year_built:1935, year_renovated:2018, features:JSON.stringify(["45 pokojů","Restaurace","Konferenční sál","Podzemní garáž 20 míst","Recepce 24/7","Wi-Fi","Zahrádka","V provozu"]) },
    { title:"Virtuální kancelář Praha 2", advert_function:2, advert_subtype:49, advert_price:3500, advert_price_currency:1, advert_price_unit:2, description:"Prestižní virtuální kancelář na Vinohradech s adresou pro sídlo firmy, přijímáním pošty a přístupem do zasedacích místností. Ideální pro freelancery, startupy a firmy bez potřeby stálých kancelářských prostor.\n\nSlužby zahrnují přeposílání pošty, telefonní linku a možnost pronájmu zasedací místnosti na hodiny.", locality_city:"Praha", locality_citypart:"Praha 2 – Vinohrady", locality_region:"Hlavní město Praha", locality_latitude:50.0750, locality_longitude:14.4380, usable_area:0, building_condition:1, building_type:2, elevator:1, parking_lots:0, garage:0, year_built:2010, year_renovated:2022, features:JSON.stringify(["Sídlo firmy","Přijímání pošty","Přeposílání pošty","Zasedací místnost","Telefonní linka","Prestižní adresa","Metro A – Náměstí Míru"]) },
    { title:"Zemědělský areál Olomouc", advert_function:1, advert_subtype:31, advert_price:18500000, advert_price_currency:1, advert_price_unit:1, description:"Zemědělský areál v úrodné Hané u Olomouce. Součástí je zemědělská hala, sila, strojovna a administrativní budova. Pozemek o rozloze 35 000 m² včetně přilehlých polí.\n\nAreál je vhodný pro rostlinnou výrobu, skladování zemědělských komodit nebo přestavbu na komerční využití.", locality_city:"Olomouc", locality_citypart:"Olomouc-okolí", locality_region:"Olomoucký kraj", locality_latitude:49.5938, locality_longitude:17.2509, usable_area:4200, estate_area:35000, building_condition:8, building_type:7, elevator:2, parking_lots:1, garage:1, energy_efficiency_rating:6, floors:1, ceiling_height:6.0, land_type:4, utilities:JSON.stringify([1,3,7]), parking_type:1, heating_type:7, highway_distance:12.0, year_built:1985, features:JSON.stringify(["Zemědělská hala","Sila","Strojovna","Administrativní budova","Pozemek 35 000 m²","Příjezdová komunikace","Elektřina 400V","Studna"]) },
  ];

  const images = {
    1: [["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80","Logistický park exteriér",1],["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80","Interiér skladu",0],["https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80","Nakládací rampy",0],["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80","Areál",0]],
    2: [["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80","Kancelářský komplex",1],["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80","Open space",0],["https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80","Zasedací místnost",0]],
    3: [["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80","Výrobní hala",1],["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80","Výrobní prostor",0],["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80","Areál",0]],
    4: [["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80","Skladový areál",1],["https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80","Sklad interiér",0],["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80","Exteriér",0]],
    5: [["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80","Kanceláře",1],["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80","Open plan",0],["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80","Lobby",0]],
    6: [["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","Pozemek",1],["https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80","Pohled na pozemek",0],["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","Okolí",0]],
    7: [["https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80","Distribuční centrum",1],["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80","Vnitřní prostor",0],["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80","Exteriér",0]],
    8: [["https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80","Kancelář",1],["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80","Pracovní prostor",0],["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80","Budova",0]],
    9: [["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80","Výrobní areál",1],["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80","Výrobní hala",0],["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80","Areál",0]],
    10: [["https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80","Pozemek",1],["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","Pohled",0],["https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80","Okolí",0]],
    11: [["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80","Logistický hub",1],["https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80","Sklad",0],["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80","Areál",0]],
    12: [["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80","Flex kanceláře",1],["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80","Coworking",0],["https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80","Zasedačka",0]],
    13: [["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80","Obchodní prostor",1],["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80","Interiér",0],["https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80","Detail",0]],
    14: [["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80","Restaurace",1],["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80","Interiér restaurace",0],["https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80","Bar",0]],
    15: [["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80","Činžovní dům",1],["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80","Interiér",0],["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80","Detail",0]],
    16: [["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80","Hotel",1],["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80","Pokoj",0],["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80","Restaurace",0]],
    17: [["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80","Kancelář",1],["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80","Zasedačka",0],["https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80","Prostor",0]],
    18: [["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","Zemědělský areál",1],["https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80","Pole",0],["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80","Hala",0]],
  };

  const insertListing = db.prepare(`INSERT INTO listings (title,advert_function,advert_type,advert_subtype,advert_price,advert_price_currency,advert_price_unit,description,locality_city,locality_street,locality_citypart,locality_region,locality_latitude,locality_longitude,usable_area,estate_area,office_area,min_divisible_area,building_condition,building_type,building_class,certification,furnished,elevator,parking_lots,parking_type,garage,energy_efficiency_rating,floors,ceiling_height,floor_load,sprinkler_type,heating_type,loading_docks,dock_type,drive_in_gates,crane_capacity,column_grid,lease_type,available_from,land_type,utilities,rail_access,highway_distance,year_built,year_renovated,extra_info,features) VALUES (@title,@advert_function,4,@advert_subtype,@advert_price,@advert_price_currency,@advert_price_unit,@description,@locality_city,@locality_street,@locality_citypart,@locality_region,@locality_latitude,@locality_longitude,@usable_area,@estate_area,@office_area,@min_divisible_area,@building_condition,@building_type,@building_class,@certification,@furnished,@elevator,@parking_lots,@parking_type,@garage,@energy_efficiency_rating,@floors,@ceiling_height,@floor_load,@sprinkler_type,@heating_type,@loading_docks,@dock_type,@drive_in_gates,@crane_capacity,@column_grid,@lease_type,@available_from,@land_type,@utilities,@rail_access,@highway_distance,@year_built,@year_renovated,@extra_info,@features)`);

  const insertImage = db.prepare(`INSERT INTO listing_images (listing_id,url,alt,is_main,sort_order) VALUES (?,?,?,?,?)`);

  const insertAll = db.transaction(() => {
    for (let i = 0; i < listings.length; i++) {
      const l = listings[i];
      // Fill defaults for nullable fields
      const row = {
        title: l.title, advert_function: l.advert_function, advert_subtype: l.advert_subtype,
        advert_price: l.advert_price, advert_price_currency: l.advert_price_currency ?? 3,
        advert_price_unit: l.advert_price_unit ?? 1, description: l.description ?? null,
        locality_city: l.locality_city, locality_street: l.locality_street ?? null,
        locality_citypart: l.locality_citypart ?? null, locality_region: l.locality_region ?? null,
        locality_latitude: l.locality_latitude ?? null, locality_longitude: l.locality_longitude ?? null,
        usable_area: l.usable_area ?? null, estate_area: l.estate_area ?? null,
        office_area: l.office_area ?? null, min_divisible_area: l.min_divisible_area ?? null,
        building_condition: l.building_condition ?? null, building_type: l.building_type ?? null,
        building_class: l.building_class ?? null, certification: l.certification ?? null,
        furnished: l.furnished ?? null, elevator: l.elevator ?? null,
        parking_lots: l.parking_lots ?? 0, parking_type: l.parking_type ?? null,
        garage: l.garage ?? 0,
        energy_efficiency_rating: l.energy_efficiency_rating ?? null,
        floors: l.floors ?? null, ceiling_height: l.ceiling_height ?? null,
        floor_load: l.floor_load ?? null, sprinkler_type: l.sprinkler_type ?? null,
        heating_type: l.heating_type ?? null, loading_docks: l.loading_docks ?? 0,
        dock_type: l.dock_type ?? null, drive_in_gates: l.drive_in_gates ?? 0,
        crane_capacity: l.crane_capacity ?? null, column_grid: l.column_grid ?? null,
        lease_type: l.lease_type ?? null, available_from: l.available_from ?? null,
        land_type: l.land_type ?? null, utilities: l.utilities ?? null,
        rail_access: l.rail_access ?? 0, highway_distance: l.highway_distance ?? null,
        year_built: l.year_built ?? null, year_renovated: l.year_renovated ?? null,
        extra_info: l.extra_info ?? null, features: l.features ?? null,
      };
      insertListing.run(row);
      const id = i + 1;
      const imgs = images[id] || [];
      for (let j = 0; j < imgs.length; j++) {
        insertImage.run(id, imgs[j][0], imgs[j][1], imgs[j][2], j);
      }
    }
  });

  insertAll();
}
