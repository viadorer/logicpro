#!/usr/bin/env python3
"""LogicPro — Python REST API + static file server.
Single-file backend with SQLite DB following Sreality data model.
"""

import json
import os
import sqlite3
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logicpro.db")
SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")

# ─────────────────────────────────────────────
# CODEBOOKS (Sreality standard)
# ─────────────────────────────────────────────
CODEBOOKS = {
    "advert_function": {1: "Prodej", 2: "Pronájem", 3: "Dražby"},
    "advert_type": {1: "Byty", 2: "Domy", 3: "Pozemky", 4: "Komerční", 5: "Ostatní"},
    "advert_subtype": {
        25: "Kanceláře", 26: "Sklady", 27: "Výroba", 28: "Obchodní prostory",
        29: "Ubytování", 30: "Restaurace", 31: "Zemědělský", 32: "Ostatní",
        38: "Činžovní dům", 49: "Virtuální kancelář",
    },
    "advert_price_currency": {1: "CZK", 2: "USD", 3: "EUR"},
    "advert_price_unit": {
        1: "za nemovitost", 2: "za měsíc", 3: "za m²",
        4: "za m²/měs.", 5: "za m²/rok", 6: "za rok",
    },
    "building_condition": {
        1: "Velmi dobrý", 2: "Dobrý", 3: "Špatný", 4: "Ve výstavbě",
        5: "Projekt", 6: "Novostavba", 7: "K demolici",
        8: "Před rekonstrukcí", 9: "Po rekonstrukci",
    },
    "building_type": {
        1: "Dřevěná", 2: "Cihlová", 3: "Kamenná", 4: "Montovaná",
        5: "Panelová", 6: "Skeletová", 7: "Smíšená",
    },
    "furnished": {1: "Ano", 2: "Ne", 3: "Částečně"},
    "elevator": {1: "Ano", 2: "Ne"},
    "energy_efficiency_rating": {
        1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G",
    },
    "object_location": {
        1: "Centrum obce", 2: "Klidná část obce", 3: "Rušná část obce",
        4: "Okraj obce", 5: "Sídliště", 6: "Polosamota", 7: "Samota",
    },
    "extra_info": {1: "Rezervováno", 2: "Prodáno"},
}

# ─────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    if os.path.exists(DB_PATH):
        return
    print("[DB] Creating database and seeding data...")
    conn = get_db()
    conn.executescript("""
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
            building_condition INTEGER,
            building_type INTEGER,
            furnished INTEGER,
            elevator INTEGER,
            parking_lots INTEGER DEFAULT 0,
            garage INTEGER DEFAULT 0,
            energy_efficiency_rating INTEGER,
            floors INTEGER,
            ceiling_height REAL,
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
    """)
    seed_data(conn)
    conn.close()
    print("[DB] Done. Seeded listings into logicpro.db")


def seed_data(conn):
    listings = [
        # 1 — Logistický park Praha-Východ (rent, sklad)
        {
            "title": "Logistický park Praha-Východ",
            "advert_function": 2, "advert_subtype": 26,
            "advert_price": 4.50, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Moderní logistický park v strategické lokalitě Praha-Východ nabízí špičkové skladové a distribuční prostory třídy A. Areál je ideální pro e-commerce, logistiku a lehkou výrobu.\n\nVýborné napojení na dálnici D1 a Pražský okruh zajišťuje rychlou dostupnost do centra Prahy i na hlavní dopravní tahy. K dispozici jsou flexibilní jednotky od 2 000 m² s možností rozšíření.\n\nAreál disponuje moderní infrastrukturou včetně LED osvětlení, sprinklerového systému, nakládacích ramp a dostatečného parkování pro osobní i nákladní automobily.",
            "locality_city": "Praha", "locality_citypart": "Praha-Východ",
            "locality_region": "Středočeský kraj",
            "locality_latitude": 50.0555, "locality_longitude": 14.6125,
            "usable_area": 12500, "building_condition": 6, "building_type": 6,
            "elevator": 2, "parking_lots": 1, "garage": 0,
            "energy_efficiency_rating": 2, "floors": 1, "ceiling_height": 12.0,
            "features": json.dumps(["LED osvětlení", "Sprinklerový systém", "Nakládací rampy", "Podlahová nosnost 5 t/m²", "BREEAM certifikace", "Parking pro kamiony", "24/7 ostraha a CCTV", "Kancelářské zázemí", "Světlá výška 12 m", "Napojení na D1"]),
        },
        # 2 — Kancelářský komplex Brno (sale, kanceláře)
        {
            "title": "Kancelářský komplex Brno",
            "advert_function": 1, "advert_subtype": 25,
            "advert_price": 45000000, "advert_price_currency": 1, "advert_price_unit": 1,
            "description": "Reprezentativní kancelářský komplex v centru Brna nabízí moderní prostory třídy A s výbornou dopravní dostupností. Budova prošla kompletní rekonstrukcí v roce 2021.\n\nObjekt disponuje 3 200 m² kancelářských ploch rozložených na 5 nadzemních podlažích s panoramatickým výhledem na město. Součástí je podzemní parkování pro 45 vozidel.",
            "locality_city": "Brno", "locality_citypart": "Brno-střed",
            "locality_region": "Jihomoravský kraj",
            "locality_latitude": 49.1951, "locality_longitude": 16.6068,
            "usable_area": 3200, "building_condition": 9, "building_type": 6,
            "elevator": 1, "parking_lots": 1, "garage": 1,
            "energy_efficiency_rating": 2, "floors": 5, "ceiling_height": 3.2,
            "features": json.dumps(["Klimatizace", "Podzemní parking 45 míst", "Recepce", "Optické připojení", "Serverovna", "Zasedací místnosti", "Kuchyňky na patře", "Bezpečnostní systém"]),
        },
        # 3 — Výrobní hala Ostrava (rent, výroba)
        {
            "title": "Výrobní hala Ostrava",
            "advert_function": 2, "advert_subtype": 27,
            "advert_price": 3.80, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Prostorná výrobní hala v průmyslové zóně Ostrava-Hrabová s vynikající dopravní dostupností. Hala je vhodná pro lehkou i středně těžkou výrobu, montáž a kompletaci.\n\nSoučástí areálu je kancelářské zázemí, sociální zařízení a zpevněná manipulační plocha. Napojení na silnici I/56 a blízkost dálnice D1.",
            "locality_city": "Ostrava", "locality_citypart": "Hrabová",
            "locality_region": "Moravskoslezský kraj",
            "locality_latitude": 49.7780, "locality_longitude": 18.2738,
            "usable_area": 8000, "building_condition": 2, "building_type": 6,
            "elevator": 2, "parking_lots": 1, "garage": 0,
            "energy_efficiency_rating": 4, "floors": 1, "ceiling_height": 8.5,
            "features": json.dumps(["Mostový jeřáb 10t", "Podlahová nosnost 3 t/m²", "Přípojka 400V", "Sociální zázemí", "Kancelářská část", "Manipulační plocha", "Oplocený areál", "Vrátnice"]),
        },
        # 4 — Skladový areál Plzeň (rent, sklad)
        {
            "title": "Skladový areál Plzeň",
            "advert_function": 2, "advert_subtype": 26,
            "advert_price": 3.90, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Rozsáhlý skladový areál na okraji Plzně s přímým napojením na dálnici D5 směr Praha/Německo. Areál nabízí moderní skladové prostory s možností dělení od 3 000 m².\n\nStrategická poloha na logistickém koridoru mezi Prahou a Bavorskem činí tento areál ideálním pro distribuci a cross-docking.",
            "locality_city": "Plzeň", "locality_citypart": "Plzeň-Bory",
            "locality_region": "Plzeňský kraj",
            "locality_latitude": 49.7384, "locality_longitude": 13.3176,
            "usable_area": 15000, "building_condition": 6, "building_type": 6,
            "elevator": 2, "parking_lots": 1, "garage": 0,
            "energy_efficiency_rating": 3, "floors": 1, "ceiling_height": 10.0,
            "features": json.dumps(["Nakládací rampy", "LED osvětlení", "Sprinklery", "Cross-docking", "Parkoviště kamionů", "Ostraha 24/7", "Kancelářská část", "Napojení na D5"]),
        },
        # 5 — A-class kanceláře Praha 4 (rent, kanceláře)
        {
            "title": "A-class kanceláře Praha 4",
            "advert_function": 2, "advert_subtype": 25,
            "advert_price": 16.50, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Prémiové kancelářské prostory v nově postaveném business parku v Praze 4 – Pankrác. Prostory nabízejí open-space i uzavřené kanceláře s flexibilním uspořádáním.\n\nBudova certifikována LEED Gold, s pokročilým systémem vzduchotechniky a řízení spotřeby energie. Přímé napojení na metro C – stanice Pankrác.",
            "locality_city": "Praha", "locality_citypart": "Praha 4 – Pankrác",
            "locality_region": "Hlavní město Praha",
            "locality_latitude": 50.0587, "locality_longitude": 14.4380,
            "usable_area": 1800, "building_condition": 6, "building_type": 6,
            "elevator": 1, "parking_lots": 1, "garage": 1,
            "energy_efficiency_rating": 1, "floors": 8, "ceiling_height": 3.0,
            "features": json.dumps(["LEED Gold", "Metro C – Pankrác", "Podzemní parking", "Recepce 24/7", "Klimatizace", "Optické připojení", "Terasa na střeše", "Kavárna v přízemí"]),
        },
        # 6 — Stavební pozemek Brno-jih (sale, pozemky)
        {
            "title": "Stavební pozemek Brno-jih",
            "advert_function": 1, "advert_subtype": 28,
            "advert_price": 28000000, "advert_price_currency": 1, "advert_price_unit": 1,
            "description": "Komerční stavební pozemek v rozvíjející se lokalitě Brno-jih, vhodný pro výstavbu obchodního centra, showroomu nebo logistického objektu.\n\nPozemek je rovinatý, zasíťovaný (elektřina, voda, plyn, kanalizace) s platným územním plánem pro komerční zástavbu. Přímý přístup z hlavní komunikace.",
            "locality_city": "Brno", "locality_citypart": "Brno-jih",
            "locality_region": "Jihomoravský kraj",
            "locality_latitude": 49.1600, "locality_longitude": 16.6300,
            "estate_area": 22000, "building_condition": None, "building_type": None,
            "features": json.dumps(["Rovinatý terén", "Kompletní inženýrské sítě", "ÚP pro komerční zástavbu", "Přístup z hlavní komunikace", "Napojení na D1", "Bez ekologické zátěže"]),
        },
        # 7 — Distribuční centrum Ostrava (rent, sklad)
        {
            "title": "Distribuční centrum Ostrava",
            "advert_function": 2, "advert_subtype": 26,
            "advert_price": 4.20, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Moderní distribuční centrum v průmyslové zóně Mošnov u Letiště Leoše Janáčka. Objekt třídy A splňuje nejvyšší standardy pro logistiku a e-commerce.\n\nAreál nabízí výbornou dopravní infrastrukturu včetně blízkosti dálnice D1, železniční vlečky a mezinárodního letiště.",
            "locality_city": "Ostrava", "locality_citypart": "Mošnov",
            "locality_region": "Moravskoslezský kraj",
            "locality_latitude": 49.6961, "locality_longitude": 18.1125,
            "usable_area": 20000, "building_condition": 6, "building_type": 6,
            "elevator": 2, "parking_lots": 1, "garage": 0,
            "energy_efficiency_rating": 2, "floors": 1, "ceiling_height": 12.0,
            "features": json.dumps(["Třída A", "Sprinklery ESFR", "LED osvětlení", "46 nakládacích doků", "Manipulační dvůr", "Železniční vlečka", "Blízkost letiště", "BREEAM Excellent"]),
        },
        # 8 — Kancelářský prostor Praha 1 (rent, kanceláře)
        {
            "title": "Kancelářský prostor Praha 1",
            "advert_function": 2, "advert_subtype": 25,
            "advert_price": 22.00, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Exkluzivní kancelářské prostory v historické budově na Novém Městě v Praze 1. Prostory kombinují klasickou architekturu se současným interiérovým designem.\n\nKanceláře jsou plně vybavené, klimatizované, s vysokými stropy a velkými okny. Ideální pro advokátní kanceláře, finanční služby a prestižní zastoupení.",
            "locality_city": "Praha", "locality_citypart": "Praha 1 – Nové Město",
            "locality_region": "Hlavní město Praha",
            "locality_latitude": 50.0815, "locality_longitude": 14.4264,
            "usable_area": 450, "building_condition": 9, "building_type": 3,
            "elevator": 1, "parking_lots": 0, "garage": 0,
            "energy_efficiency_rating": 4, "floors": 4, "ceiling_height": 3.8,
            "furnished": 1,
            "features": json.dumps(["Historická budova", "Klimatizace", "Vysoké stropy 3,8 m", "Plně vybavené", "Recepční služby", "Zasedací místnost", "Kuchyňka", "Optický internet"]),
        },
        # 9 — Výrobní areál Plzeň (sale, výroba)
        {
            "title": "Výrobní areál Plzeň",
            "advert_function": 1, "advert_subtype": 27,
            "advert_price": 35000000, "advert_price_currency": 1, "advert_price_unit": 1,
            "description": "Kompletní výrobní areál v Plzni se dvěma výrobními halami, administrativní budovou a rozsáhlým pozemkem. Vhodné pro strojírenskou výrobu, automotive nebo potravinářství.\n\nAreál prošel částečnou modernizací v roce 2020. Výrobní haly jsou vybaveny mostovými jeřáby a kompresory.",
            "locality_city": "Plzeň", "locality_citypart": "Plzeň-Skvrňany",
            "locality_region": "Plzeňský kraj",
            "locality_latitude": 49.7470, "locality_longitude": 13.3540,
            "usable_area": 5500, "estate_area": 12000,
            "building_condition": 9, "building_type": 6,
            "elevator": 2, "parking_lots": 1, "garage": 1,
            "energy_efficiency_rating": 4, "floors": 2, "ceiling_height": 7.5,
            "features": json.dumps(["2 výrobní haly", "Mostový jeřáb 20t", "Administrativní budova", "Kompresorovna", "Trafostanice", "Oplocený areál", "Vrátnice", "Pozemek 12 000 m²"]),
        },
        # 10 — Pozemek Praha-západ (sale, obchodní prostory)
        {
            "title": "Pozemek Praha-západ",
            "advert_function": 1, "advert_subtype": 28,
            "advert_price": 52000000, "advert_price_currency": 1, "advert_price_unit": 1,
            "description": "Rozsáhlý komerční pozemek v atraktivní lokalitě Praha-západ, vhodný pro výstavbu retailového parku, showroomů nebo mixed-use projektu.\n\nPozemek s regulérním tvarem a minimálním převýšením, kompletně zasíťovaný. Územní plán umožňuje komerční a obchodní zástavbu.",
            "locality_city": "Praha", "locality_citypart": "Praha-západ",
            "locality_region": "Středočeský kraj",
            "locality_latitude": 50.0300, "locality_longitude": 14.2800,
            "estate_area": 18000,
            "features": json.dumps(["Rovinatý pozemek", "Kompletní sítě", "ÚP pro komerci", "Blízkost Pražského okruhu", "Bez zátěže", "Pravidelný tvar"]),
        },
        # 11 — Logistický hub Brno (rent, sklad)
        {
            "title": "Logistický hub Brno",
            "advert_function": 2, "advert_subtype": 26,
            "advert_price": 4.10, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Strategicky umístěný logistický hub na křižovatce dálnic D1 a D2 v Brně. Objekt nabízí skladové prostory třídy A s možností build-to-suit.\n\nIdeální pozice pro distribuci po celé Moravě a do střední Evropy. V blízkosti letiště Brno-Tuřany.",
            "locality_city": "Brno", "locality_citypart": "Brno-Slatina",
            "locality_region": "Jihomoravský kraj",
            "locality_latitude": 49.1700, "locality_longitude": 16.7000,
            "usable_area": 10000, "building_condition": 6, "building_type": 6,
            "elevator": 2, "parking_lots": 1, "garage": 0,
            "energy_efficiency_rating": 2, "floors": 1, "ceiling_height": 11.0,
            "features": json.dumps(["Třída A", "Křižovatka D1/D2", "Nakládací doky", "LED osvětlení", "Sprinklery", "Build-to-suit možnost", "Blízkost letiště", "Kancelářské zázemí"]),
        },
        # 12 — Flex kanceláře Ostrava (rent, kanceláře)
        {
            "title": "Flex kanceláře Ostrava",
            "advert_function": 2, "advert_subtype": 25,
            "advert_price": 12.00, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Moderní flexibilní kanceláře v nově zrekonstruované budově v centru Ostravy. Prostory jsou připraveny k okamžitému nastěhování s možností krátkodobého i dlouhodobého pronájmu.\n\nBudova nabízí coworkingové zázemí, zasedací místnosti a společné prostory. Výborná dostupnost MHD.",
            "locality_city": "Ostrava", "locality_citypart": "Moravská Ostrava",
            "locality_region": "Moravskoslezský kraj",
            "locality_latitude": 49.8345, "locality_longitude": 18.2920,
            "usable_area": 600, "building_condition": 9, "building_type": 2,
            "elevator": 1, "parking_lots": 1, "garage": 0,
            "energy_efficiency_rating": 3, "floors": 3, "ceiling_height": 3.0,
            "furnished": 1,
            "features": json.dumps(["Plně vybavené", "Coworking", "Zasedací místnosti", "Kuchyňka", "Klimatizace", "Optický internet", "Recepce", "MHD u budovy"]),
        },
        # 13 — Obchodní prostory Praha-Vinohrady (rent, obchodní)
        {
            "title": "Obchodní prostory Praha-Vinohrady",
            "advert_function": 2, "advert_subtype": 28,
            "advert_price": 18.00, "advert_price_currency": 3, "advert_price_unit": 4,
            "description": "Atraktivní obchodní prostory v přízemí činžovního domu na frekventované ulici Vinohradské třídy. Prostory vhodné pro showroom, butik, kavárnu nebo kancelář s klientským zázemím.\n\nVelká výloha zajišťuje výbornou viditelnost. Prostory je možné upravit dle požadavků nájemce.",
            "locality_city": "Praha", "locality_citypart": "Praha 2 – Vinohrady",
            "locality_region": "Hlavní město Praha",
            "locality_latitude": 50.0754, "locality_longitude": 14.4430,
            "usable_area": 280, "building_condition": 9, "building_type": 2,
            "elevator": 2, "parking_lots": 0, "garage": 0,
            "energy_efficiency_rating": 4, "floors": 1, "ceiling_height": 4.2,
            "features": json.dumps(["Výloha na ulici", "Frekventovaná lokace", "Metro A – Náměstí Míru", "Úprava dle nájemce", "Sociální zázemí", "Bezbariérový přístup"]),
        },
        # 14 — Restaurace & bar Brno (rent, restaurace)
        {
            "title": "Restaurace & bar Brno-centrum",
            "advert_function": 2, "advert_subtype": 30,
            "advert_price": 85000, "advert_price_currency": 1, "advert_price_unit": 2,
            "description": "Plně vybavená restaurace s barem v centru Brna na náměstí Svobody. Prostory zahrnují hlavní sál pro 80 hostů, bar, kuchyni a letní zahrádku.\n\nNemovitost je vhodná pro restauraci, café-bar nebo event space. Kompletní gastro vybavení součástí pronájmu.",
            "locality_city": "Brno", "locality_citypart": "Brno-střed",
            "locality_region": "Jihomoravský kraj",
            "locality_latitude": 49.1953, "locality_longitude": 16.6080,
            "usable_area": 350, "building_condition": 1, "building_type": 2,
            "elevator": 2, "parking_lots": 0, "garage": 0,
            "energy_efficiency_rating": 4, "floors": 1, "ceiling_height": 3.5,
            "furnished": 1,
            "features": json.dumps(["Kapacita 80 hostů", "Profesionální kuchyně", "Bar", "Letní zahrádka", "Klimatizace", "Gastro vybavení v ceně", "WC pro hosty", "Centrum města"]),
        },
        # 15 — Činžovní dům Praha-Žižkov (sale)
        {
            "title": "Činžovní dům Praha-Žižkov",
            "advert_function": 1, "advert_subtype": 38,
            "advert_price": 78000000, "advert_price_currency": 1, "advert_price_unit": 1,
            "description": "Činžovní dům v žádané lokalitě Prahy 3 – Žižkov s 12 bytovými jednotkami a 2 komerčními prostory v přízemí. Dům je v dobrém stavu s potenciálem dalšího zhodnocení.\n\nVšechny byty jsou pronajaty s celkovým měsíčním výnosem 380 000 CZK. Výnos 5,8 % p.a.",
            "locality_city": "Praha", "locality_citypart": "Praha 3 – Žižkov",
            "locality_region": "Hlavní město Praha",
            "locality_latitude": 50.0900, "locality_longitude": 14.4500,
            "usable_area": 1200, "building_condition": 2, "building_type": 2,
            "elevator": 2, "parking_lots": 0, "garage": 0,
            "energy_efficiency_rating": 5, "floors": 5, "ceiling_height": 3.2,
            "features": json.dumps(["12 bytových jednotek", "2 komerční prostory", "Výnos 5,8 % p.a.", "Plně pronajato", "Dobrý stav", "Potenciál rekonstrukce", "Metro A – Flora", "Klidná ulice"]),
        },
        # 16 — Hotel Plzeň (sale, ubytování)
        {
            "title": "Hotel Plzeň-centrum",
            "advert_function": 1, "advert_subtype": 29,
            "advert_price": 62000000, "advert_price_currency": 1, "advert_price_unit": 1,
            "description": "Tříhvězdičkový hotel v historickém centru Plzně s 45 pokoji, restaurací a konferenčním sálem. Hotel je v provozu s ustálenou klientelou.\n\nBudova prošla rekonstrukcí v roce 2018. Součástí je podzemní garáž pro 20 vozidel a zahrádka.",
            "locality_city": "Plzeň", "locality_citypart": "Plzeň-centrum",
            "locality_region": "Plzeňský kraj",
            "locality_latitude": 49.7476, "locality_longitude": 13.3776,
            "usable_area": 2800, "building_condition": 9, "building_type": 2,
            "elevator": 1, "parking_lots": 1, "garage": 1,
            "energy_efficiency_rating": 3, "floors": 4, "ceiling_height": 3.0,
            "furnished": 1,
            "features": json.dumps(["45 pokojů", "Restaurace", "Konferenční sál", "Podzemní garáž 20 míst", "Recepce 24/7", "Wi-Fi", "Zahrádka", "V provozu"]),
        },
        # 17 — Virtuální kancelář Praha (rent)
        {
            "title": "Virtuální kancelář Praha 2",
            "advert_function": 2, "advert_subtype": 49,
            "advert_price": 3500, "advert_price_currency": 1, "advert_price_unit": 2,
            "description": "Prestižní virtuální kancelář na Vinohradech s adresou pro sídlo firmy, přijímáním pošty a přístupem do zasedacích místností. Ideální pro freelancery, startupy a firmy bez potřeby stálých kancelářských prostor.\n\nSlužby zahrnují přeposílání pošty, telefonní linku a možnost pronájmu zasedací místnosti na hodiny.",
            "locality_city": "Praha", "locality_citypart": "Praha 2 – Vinohrady",
            "locality_region": "Hlavní město Praha",
            "locality_latitude": 50.0750, "locality_longitude": 14.4380,
            "usable_area": 0, "building_condition": 1, "building_type": 2,
            "elevator": 1, "parking_lots": 0, "garage": 0,
            "features": json.dumps(["Sídlo firmy", "Přijímání pošty", "Přeposílání pošty", "Zasedací místnost", "Telefonní linka", "Prestižní adresa", "Metro A – Náměstí Míru"]),
        },
        # 18 — Zemědělský areál Olomouc (sale, zemědělský)
        {
            "title": "Zemědělský areál Olomouc",
            "advert_function": 1, "advert_subtype": 31,
            "advert_price": 18500000, "advert_price_currency": 1, "advert_price_unit": 1,
            "description": "Zemědělský areál v úrodné Hané u Olomouce. Součástí je zemědělská hala, sila, strojovna a administrativní budova. Pozemek o rozloze 35 000 m² včetně přilehlých polí.\n\nAreál je vhodný pro rostlinnou výrobu, skladování zemědělských komodit nebo přestavbu na komerční využití.",
            "locality_city": "Olomouc", "locality_citypart": "Olomouc-okolí",
            "locality_region": "Olomoucký kraj",
            "locality_latitude": 49.5938, "locality_longitude": 17.2509,
            "usable_area": 4200, "estate_area": 35000,
            "building_condition": 8, "building_type": 7,
            "elevator": 2, "parking_lots": 1, "garage": 1,
            "energy_efficiency_rating": 6, "floors": 1, "ceiling_height": 6.0,
            "features": json.dumps(["Zemědělská hala", "Sila", "Strojovna", "Administrativní budova", "Pozemek 35 000 m²", "Příjezdová komunikace", "Elektřina 400V", "Studna"]),
        },
    ]

    # Unsplash image sets per listing
    images = {
        1: [
            ("https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80", "Logistický park exteriér", 1),
            ("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", "Interiér skladu", 0),
            ("https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80", "Nakládací rampy", 0),
            ("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80", "Areál", 0),
        ],
        2: [
            ("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", "Kancelářský komplex", 1),
            ("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80", "Open space", 0),
            ("https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80", "Zasedací místnost", 0),
        ],
        3: [
            ("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", "Výrobní hala", 1),
            ("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80", "Výrobní prostor", 0),
            ("https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80", "Areál", 0),
        ],
        4: [
            ("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", "Skladový areál", 1),
            ("https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80", "Sklad interiér", 0),
            ("https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80", "Exteriér", 0),
        ],
        5: [
            ("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80", "Kanceláře", 1),
            ("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", "Open plan", 0),
            ("https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80", "Lobby", 0),
        ],
        6: [
            ("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "Pozemek", 1),
            ("https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80", "Pohled na pozemek", 0),
            ("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "Okolí", 0),
        ],
        7: [
            ("https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80", "Distribuční centrum", 1),
            ("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", "Vnitřní prostor", 0),
            ("https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80", "Exteriér", 0),
        ],
        8: [
            ("https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80", "Kancelář", 1),
            ("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80", "Pracovní prostor", 0),
            ("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", "Budova", 0),
        ],
        9: [
            ("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80", "Výrobní areál", 1),
            ("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", "Výrobní hala", 0),
            ("https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80", "Areál", 0),
        ],
        10: [
            ("https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80", "Pozemek", 1),
            ("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "Pohled", 0),
            ("https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80", "Okolí", 0),
        ],
        11: [
            ("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", "Logistický hub", 1),
            ("https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80", "Sklad", 0),
            ("https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80", "Areál", 0),
        ],
        12: [
            ("https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80", "Flex kanceláře", 1),
            ("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80", "Coworking", 0),
            ("https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80", "Zasedačka", 0),
        ],
        13: [
            ("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80", "Obchodní prostor", 1),
            ("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80", "Interiér", 0),
            ("https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80", "Detail", 0),
        ],
        14: [
            ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "Restaurace", 1),
            ("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "Interiér restaurace", 0),
            ("https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", "Bar", 0),
        ],
        15: [
            ("https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80", "Činžovní dům", 1),
            ("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80", "Interiér", 0),
            ("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", "Detail", 0),
        ],
        16: [
            ("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "Hotel", 1),
            ("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", "Pokoj", 0),
            ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "Restaurace", 0),
        ],
        17: [
            ("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", "Kancelář", 1),
            ("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80", "Zasedačka", 0),
            ("https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80", "Prostor", 0),
        ],
        18: [
            ("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "Zemědělský areál", 1),
            ("https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80", "Pole", 0),
            ("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80", "Hala", 0),
        ],
    }

    for i, listing in enumerate(listings, 1):
        cols = list(listing.keys())
        placeholders = ",".join(["?"] * len(cols))
        sql = f"INSERT INTO listings ({','.join(cols)}) VALUES ({placeholders})"
        conn.execute(sql, list(listing.values()))

        for order, (url, alt, is_main) in enumerate(images.get(i, [])):
            conn.execute(
                "INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES (?,?,?,?,?)",
                (i, url, alt, is_main, order),
            )

    conn.commit()


# ─────────────────────────────────────────────
# API HELPERS
# ─────────────────────────────────────────────

def row_to_dict(row):
    return dict(row) if row else None


def json_response(handler, data, status=200):
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(body)


def parse_int(val, default=None):
    try:
        return int(val)
    except (TypeError, ValueError):
        return default


def parse_float(val, default=None):
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


# ─────────────────────────────────────────────
# REQUEST HANDLER
# ─────────────────────────────────────────────

class LogicProHandler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SRC_DIR, **kwargs)

    def log_message(self, fmt, *args):
        # Quieter logs — only log API calls
        if "/api/" in (args[0] if args else ""):
            super().log_message(fmt, *args)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path.startswith("/api/"):
            self.handle_api(path, parse_qs(parsed.query))
        else:
            super().do_GET()

    def handle_api(self, path, qs):
        def q(key, default=None):
            vals = qs.get(key, [])
            return vals[0] if vals else default

        conn = get_db()

        try:
            # GET /api/codebooks
            if path == "/api/codebooks":
                json_response(self, CODEBOOKS)

            # GET /api/filters
            elif path == "/api/filters":
                cities = conn.execute(
                    "SELECT locality_city, COUNT(*) as cnt FROM listings GROUP BY locality_city ORDER BY cnt DESC"
                ).fetchall()
                subtypes = conn.execute(
                    "SELECT advert_subtype, COUNT(*) as cnt FROM listings GROUP BY advert_subtype ORDER BY cnt DESC"
                ).fetchall()
                json_response(self, {
                    "cities": [{"value": r["locality_city"], "count": r["cnt"]} for r in cities],
                    "subtypes": [{"value": r["advert_subtype"], "label": CODEBOOKS["advert_subtype"].get(r["advert_subtype"], "?"), "count": r["cnt"]} for r in subtypes],
                })

            # GET /api/listings/featured
            elif path == "/api/listings/featured":
                rows = conn.execute("""
                    SELECT l.*, li.url as main_image FROM listings l
                    LEFT JOIN listing_images li ON li.listing_id = l.id AND li.is_main = 1
                    ORDER BY l.id LIMIT 3
                """).fetchall()
                json_response(self, {"listings": [row_to_dict(r) for r in rows]})

            # GET /api/listings/<id>/similar
            elif path.startswith("/api/listings/") and path.endswith("/similar"):
                lid = parse_int(path.split("/")[3])
                if lid is None:
                    json_response(self, {"error": "Invalid ID"}, 400)
                    return
                listing = conn.execute("SELECT * FROM listings WHERE id=?", (lid,)).fetchone()
                if not listing:
                    json_response(self, {"error": "Not found"}, 404)
                    return
                rows = conn.execute("""
                    SELECT l.*, li.url as main_image FROM listings l
                    LEFT JOIN listing_images li ON li.listing_id = l.id AND li.is_main = 1
                    WHERE l.id != ? AND (l.advert_subtype = ? OR l.locality_city = ?)
                    ORDER BY RANDOM() LIMIT 3
                """, (lid, listing["advert_subtype"], listing["locality_city"])).fetchall()
                json_response(self, {"listings": [row_to_dict(r) for r in rows]})

            # GET /api/listings/<id>
            elif path.startswith("/api/listings/") and len(path.split("/")) == 4:
                lid = parse_int(path.split("/")[3])
                if lid is None:
                    json_response(self, {"error": "Invalid ID"}, 400)
                    return
                row = conn.execute("SELECT * FROM listings WHERE id=?", (lid,)).fetchone()
                if not row:
                    json_response(self, {"error": "Not found"}, 404)
                    return
                data = row_to_dict(row)
                imgs = conn.execute(
                    "SELECT * FROM listing_images WHERE listing_id=? ORDER BY is_main DESC, sort_order",
                    (lid,),
                ).fetchall()
                data["images"] = [row_to_dict(img) for img in imgs]
                # Parse features JSON
                if data.get("features"):
                    try:
                        data["features"] = json.loads(data["features"])
                    except json.JSONDecodeError:
                        pass
                json_response(self, data)

            # GET /api/listings
            elif path == "/api/listings":
                where = []
                params = []

                af = parse_int(q("advert_function"))
                if af:
                    where.append("l.advert_function = ?")
                    params.append(af)

                ast = q("advert_subtype")
                if ast:
                    subs = [int(s) for s in ast.split(",") if s.isdigit()]
                    if subs:
                        where.append(f"l.advert_subtype IN ({','.join('?' * len(subs))})")
                        params.extend(subs)

                city = q("locality_city")
                if city:
                    where.append("l.locality_city = ?")
                    params.append(city)

                amin = parse_int(q("area_min"))
                if amin:
                    where.append("(COALESCE(l.usable_area, 0) + COALESCE(l.estate_area, 0)) >= ?")
                    params.append(amin)

                amax = parse_int(q("area_max"))
                if amax:
                    where.append("(COALESCE(l.usable_area, 0) + COALESCE(l.estate_area, 0)) <= ?")
                    params.append(amax)

                pmin = parse_int(q("price_min"))
                if pmin:
                    where.append("l.advert_price >= ?")
                    params.append(pmin)

                pmax = parse_int(q("price_max"))
                if pmax:
                    where.append("l.advert_price <= ?")
                    params.append(pmax)

                where_sql = (" WHERE " + " AND ".join(where)) if where else ""

                sort_map = {
                    "price_asc": "l.advert_price ASC",
                    "price_desc": "l.advert_price DESC",
                    "area_asc": "(COALESCE(l.usable_area,0)+COALESCE(l.estate_area,0)) ASC",
                    "area_desc": "(COALESCE(l.usable_area,0)+COALESCE(l.estate_area,0)) DESC",
                    "newest": "l.created_at DESC",
                }
                sort_sql = sort_map.get(q("sort"), "l.id ASC")

                limit = parse_int(q("limit"), 20)
                offset = parse_int(q("offset"), 0)

                # Count
                total = conn.execute(f"SELECT COUNT(*) as cnt FROM listings l{where_sql}", params).fetchone()["cnt"]

                # Fetch
                rows = conn.execute(f"""
                    SELECT l.*, li.url as main_image FROM listings l
                    LEFT JOIN listing_images li ON li.listing_id = l.id AND li.is_main = 1
                    {where_sql}
                    ORDER BY {sort_sql}
                    LIMIT ? OFFSET ?
                """, params + [limit, offset]).fetchall()

                json_response(self, {
                    "total": total,
                    "listings": [row_to_dict(r) for r in rows],
                })

            else:
                json_response(self, {"error": "Not found"}, 404)

        finally:
            conn.close()


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    port = 3000
    server = HTTPServer(("0.0.0.0", port), LogicProHandler)
    print(f"\n  LogicPro server running at http://localhost:{port}\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()
