BEGIN;

-- ============================================================
-- LISTINGS (18 rows)
-- ============================================================

-- 1) Logistický park Praha-Východ
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Logistický park Praha-Východ', 2, 4, 26, 4.50, 3, 4, E'Moderní logistický park v strategické lokalitě Praha-Východ nabízí špičkové skladové a distribuční prostory třídy A. Areál je ideální pro e-commerce, logistiku a lehkou výrobu.\n\nVýborné napojení na dálnici D1 a Pražský okruh zajišťuje rychlou dostupnost do centra Prahy i na hlavní dopravní tahy. K dispozici jsou flexibilní jednotky od 2 000 m² s možností rozšíření.\n\nAreál disponuje moderní infrastrukturou včetně LED osvětlení, sprinklerového systému, nakládacích ramp a dostatečného parkování pro osobní i nákladní automobily.', 'Praha', NULL, 'Praha-Východ', 'Středočeský kraj', 50.0555, 14.6125, 12500, NULL, 800, 2000, 6, 6, 1, 2, NULL, 2, 1, 5, 0, 2, 1, 12.0, 3, 4, 7, 24, 1, 4, NULL, '12x24 m', 1, '2026-05-01', NULL, NULL, 0, 1.2, 2022, NULL, NULL, '["LED osvětlení","Sprinklerový systém","Nakládací rampy","Podlahová nosnost 5 t/m²","BREEAM certifikace","Parking pro kamiony","24/7 ostraha a CCTV","Kancelářské zázemí","Světlá výška 12 m","Napojení na D1"]');

-- 2) Kancelářský komplex Brno
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Kancelářský komplex Brno', 1, 4, 25, 45000000, 1, 1, E'Reprezentativní kancelářský komplex v centru Brna nabízí moderní prostory třídy A s výbornou dopravní dostupností. Budova prošla kompletní rekonstrukcí v roce 2021.\n\nObjekt disponuje 3 200 m² kancelářských ploch rozložených na 5 nadzemních podlažích s panoramatickým výhledem na město. Součástí je podzemní parkování pro 45 vozidel.', 'Brno', NULL, 'Brno-střed', 'Jihomoravský kraj', 49.1951, 16.6068, 3200, NULL, NULL, NULL, 9, 6, 1, 3, NULL, 1, 1, 3, 1, 2, 5, 3.2, NULL, NULL, 4, 0, NULL, 0, NULL, NULL, 4, NULL, NULL, NULL, 0, NULL, 2005, 2021, NULL, '["Klimatizace","Podzemní parking 45 míst","Recepce","Optické připojení","Serverovna","Zasedací místnosti","Kuchyňky na patře","Bezpečnostní systém"]');

-- 3) Výrobní hala Ostrava
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Výrobní hala Ostrava', 2, 4, 27, 3.80, 3, 4, E'Prostorná výrobní hala v průmyslové zóně Ostrava-Hrabová s vynikající dopravní dostupností. Hala je vhodná pro lehkou i středně těžkou výrobu, montáž a kompletaci.\n\nSoučástí areálu je kancelářské zázemí, sociální zařízení a zpevněná manipulační plocha. Napojení na silnici I/56 a blízkost dálnice D1.', 'Ostrava', NULL, 'Hrabová', 'Moravskoslezský kraj', 49.7780, 18.2738, 8000, NULL, 400, NULL, 2, 6, 2, NULL, NULL, 2, 1, 1, 0, 4, 1, 8.5, 2, 2, 2, 0, NULL, 0, 10.0, '18x12 m', NULL, NULL, NULL, NULL, 0, 3.5, 2008, NULL, NULL, '["Mostový jeřáb 10t","Podlahová nosnost 3 t/m²","Přípojka 400V","Sociální zázemí","Kancelářská část","Manipulační plocha","Oplocený areál","Vrátnice"]');

-- 4) Skladový areál Plzeň
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Skladový areál Plzeň', 2, 4, 26, 3.90, 3, 4, E'Rozsáhlý skladový areál na okraji Plzně s přímým napojením na dálnici D5 směr Praha/Německo. Areál nabízí moderní skladové prostory s možností dělení od 3 000 m².\n\nStrategická poloha na logistickém koridoru mezi Prahou a Bavorskem činí tento areál ideálním pro distribuci a cross-docking.', 'Plzeň', NULL, 'Plzeň-Bory', 'Plzeňský kraj', 49.7384, 13.3176, 15000, NULL, 600, 3000, 6, 6, 1, 4, NULL, 2, 1, 5, 0, 3, 1, 10.0, 3, 2, 7, 18, 3, 2, NULL, '12x24 m', 1, '2026-04-01', NULL, NULL, 0, 0.8, 2020, NULL, NULL, '["Nakládací rampy","LED osvětlení","Sprinklery","Cross-docking","Parkoviště kamionů","Ostraha 24/7","Kancelářská část","Napojení na D5"]');

-- 5) A-class kanceláře Praha 4
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('A-class kanceláře Praha 4', 2, 4, 25, 16.50, 3, 4, E'Prémiové kancelářské prostory v nově postaveném business parku v Praze 4 – Pankrác. Prostory nabízejí open-space i uzavřené kanceláře s flexibilním uspořádáním.\n\nBudova certifikována LEED Gold, s pokročilým systémem vzduchotechniky a řízení spotřeby energie. Přímé napojení na metro C – stanice Pankrác.', 'Praha', NULL, 'Praha 4 – Pankrác', 'Hlavní město Praha', 50.0587, 14.4380, 1800, NULL, NULL, NULL, 6, 6, 1, 7, NULL, 1, 1, 3, 1, 1, 8, 3.0, NULL, NULL, 4, 0, NULL, 0, NULL, NULL, 1, NULL, NULL, NULL, 0, NULL, 2023, NULL, NULL, '["LEED Gold","Metro C – Pankrác","Podzemní parking","Recepce 24/7","Klimatizace","Optické připojení","Terasa na střeše","Kavárna v přízemí"]');

-- 6) Stavební pozemek Brno-jih
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Stavební pozemek Brno-jih', 1, 4, 28, 28000000, 1, 1, E'Komerční stavební pozemek v rozvíjející se lokalitě Brno-jih, vhodný pro výstavbu obchodního centra, showroomu nebo logistického objektu.\n\nPozemek je rovinatý, zasíťovaný (elektřina, voda, plyn, kanalizace) s platným územním plánem pro komerční zástavbu. Přímý přístup z hlavní komunikace.', 'Brno', NULL, 'Brno-jih', 'Jihomoravský kraj', 49.1600, 16.6300, NULL, 22000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 1, '[1,2,3,4]', 0, 2.5, NULL, NULL, NULL, '["Rovinatý terén","Kompletní inženýrské sítě","ÚP pro komerční zástavbu","Přístup z hlavní komunikace","Napojení na D1","Bez ekologické zátěže"]');

-- 7) Distribuční centrum Ostrava
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Distribuční centrum Ostrava', 2, 4, 26, 4.20, 3, 4, E'Moderní distribuční centrum v průmyslové zóně Mošnov u Letiště Leoše Janáčka. Objekt třídy A splňuje nejvyšší standardy pro logistiku a e-commerce.\n\nAreál nabízí výbornou dopravní infrastrukturu včetně blízkosti dálnice D1, železniční vlečky a mezinárodního letiště.', 'Ostrava', NULL, 'Mošnov', 'Moravskoslezský kraj', 49.6961, 18.1125, 20000, NULL, 1200, 5000, 6, 6, 1, 2, NULL, 2, 1, 5, 0, 2, 1, 12.0, 3, 4, 6, 46, 1, 6, NULL, '12x24 m', 1, '2026-06-01', NULL, NULL, 1, 2.0, 2021, NULL, NULL, '["Třída A","Sprinklery ESFR","LED osvětlení","46 nakládacích doků","Manipulační dvůr","Železniční vlečka","Blízkost letiště","BREEAM Excellent"]');

-- 8) Kancelářský prostor Praha 1
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Kancelářský prostor Praha 1', 2, 4, 25, 22.00, 3, 4, E'Exkluzivní kancelářské prostory v historické budově na Novém Městě v Praze 1. Prostory kombinují klasickou architekturu se současným interiérovým designem.\n\nKanceláře jsou plně vybavené, klimatizované, s vysokými stropy a velkými okny. Ideální pro advokátní kanceláře, finanční služby a prestižní zastoupení.', 'Praha', NULL, 'Praha 1 – Nové Město', 'Hlavní město Praha', 50.0815, 14.4264, 450, NULL, NULL, NULL, 9, 3, 1, NULL, 1, 1, 0, 6, 0, 4, 4, 3.8, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, 3, NULL, NULL, NULL, 0, NULL, 1905, 2019, NULL, '["Historická budova","Klimatizace","Vysoké stropy 3,8 m","Plně vybavené","Recepční služby","Zasedací místnost","Kuchyňka","Optický internet"]');

-- 9) Výrobní areál Plzeň
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Výrobní areál Plzeň', 1, 4, 27, 35000000, 1, 1, E'Kompletní výrobní areál v Plzni se dvěma výrobními halami, administrativní budovou a rozsáhlým pozemkem. Vhodné pro strojírenskou výrobu, automotive nebo potravinářství.\n\nAreál prošel částečnou modernizací v roce 2020. Výrobní haly jsou vybaveny mostovými jeřáby a kompresory.', 'Plzeň', NULL, 'Plzeň-Skvrňany', 'Plzeňský kraj', 49.7470, 13.3540, 5500, 12000, 650, NULL, 9, 6, 2, NULL, NULL, 2, 1, 1, 1, 4, 2, 7.5, 4, 2, 2, 0, NULL, 0, 20.0, '18x18 m', NULL, NULL, NULL, NULL, 0, 5.0, 1998, 2020, NULL, '["2 výrobní haly","Mostový jeřáb 20t","Administrativní budova","Kompresorovna","Trafostanice","Oplocený areál","Vrátnice","Pozemek 12 000 m²"]');

-- 10) Pozemek Praha-západ
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Pozemek Praha-západ', 1, 4, 28, 52000000, 1, 1, E'Rozsáhlý komerční pozemek v atraktivní lokalitě Praha-západ, vhodný pro výstavbu retailového parku, showroomů nebo mixed-use projektu.\n\nPozemek s regulérním tvarem a minimálním převýšením, kompletně zasíťovaný. Územní plán umožňuje komerční a obchodní zástavbu.', 'Praha', NULL, 'Praha-západ', 'Středočeský kraj', 50.0300, 14.2800, NULL, 18000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 1, '[1,2,3,4,5]', 0, 1.5, NULL, NULL, NULL, '["Rovinatý pozemek","Kompletní sítě","ÚP pro komerci","Blízkost Pražského okruhu","Bez zátěže","Pravidelný tvar"]');

-- 11) Logistický hub Brno
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Logistický hub Brno', 2, 4, 26, 4.10, 3, 4, E'Strategicky umístěný logistický hub na křižovatce dálnic D1 a D2 v Brně. Objekt nabízí skladové prostory třídy A s možností build-to-suit.\n\nIdeální pozice pro distribuci po celé Moravě a do střední Evropy. V blízkosti letiště Brno-Tuřany.', 'Brno', NULL, 'Brno-Slatina', 'Jihomoravský kraj', 49.1700, 16.7000, 10000, NULL, 500, 2500, 6, 6, 1, 3, NULL, 2, 1, 5, 0, 2, 1, 11.0, 3, 2, 6, 20, 1, 3, NULL, '12x24 m', 1, '2026-07-01', NULL, NULL, 0, 0.5, 2019, NULL, NULL, '["Třída A","Křižovatka D1/D2","Nakládací doky","LED osvětlení","Sprinklery","Build-to-suit možnost","Blízkost letiště","Kancelářské zázemí"]');

-- 12) Flex kanceláře Ostrava
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Flex kanceláře Ostrava', 2, 4, 25, 12.00, 3, 4, E'Moderní flexibilní kanceláře v nově zrekonstruované budově v centru Ostravy. Prostory jsou připraveny k okamžitému nastěhování s možností krátkodobého i dlouhodobého pronájmu.\n\nBudova nabízí coworkingové zázemí, zasedací místnosti a společné prostory. Výborná dostupnost MHD.', 'Ostrava', NULL, 'Moravská Ostrava', 'Moravskoslezský kraj', 49.8345, 18.2920, 600, NULL, NULL, NULL, 9, 2, 2, NULL, 1, 1, 1, 2, 0, 3, 3, 3.0, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, 4, NULL, NULL, NULL, 0, NULL, 1975, 2023, NULL, '["Plně vybavené","Coworking","Zasedací místnosti","Kuchyňka","Klimatizace","Optický internet","Recepce","MHD u budovy"]');

-- 13) Obchodní prostory Praha-Vinohrady
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Obchodní prostory Praha-Vinohrady', 2, 4, 28, 18.00, 3, 4, E'Atraktivní obchodní prostory v přízemí činžovního domu na frekventované ulici Vinohradské třídy. Prostory vhodné pro showroom, butik, kavárnu nebo kancelář s klientským zázemím.\n\nVelká výloha zajišťuje výbornou viditelnost. Prostory je možné upravit dle požadavků nájemce.', 'Praha', NULL, 'Praha 2 – Vinohrady', 'Hlavní město Praha', 50.0754, 14.4430, 280, NULL, NULL, NULL, 9, 2, NULL, NULL, NULL, 2, 0, 6, 0, 4, 1, 4.2, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 1910, 2020, NULL, '["Výloha na ulici","Frekventovaná lokace","Metro A – Náměstí Míru","Úprava dle nájemce","Sociální zázemí","Bezbariérový přístup"]');

-- 14) Restaurace & bar Brno-centrum
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Restaurace & bar Brno-centrum', 2, 4, 30, 85000, 1, 2, E'Plně vybavená restaurace s barem v centru Brna na náměstí Svobody. Prostory zahrnují hlavní sál pro 80 hostů, bar, kuchyni a letní zahrádku.\n\nNemovitost je vhodná pro restauraci, café-bar nebo event space. Kompletní gastro vybavení součástí pronájmu.', 'Brno', NULL, 'Brno-střed', 'Jihomoravský kraj', 49.1953, 16.6080, 350, NULL, NULL, NULL, 1, 2, NULL, NULL, 1, 2, 0, 6, 0, 4, 1, 3.5, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 1890, 2018, NULL, '["Kapacita 80 hostů","Profesionální kuchyně","Bar","Letní zahrádka","Klimatizace","Gastro vybavení v ceně","WC pro hosty","Centrum města"]');

-- 15) Činžovní dům Praha-Žižkov
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Činžovní dům Praha-Žižkov', 1, 4, 38, 78000000, 1, 1, E'Činžovní dům v žádané lokalitě Prahy 3 – Žižkov s 12 bytovými jednotkami a 2 komerčními prostory v přízemí. Dům je v dobrém stavu s potenciálem dalšího zhodnocení.\n\nVšechny byty jsou pronajaty s celkovým měsíčním výnosem 380 000 CZK. Výnos 5,8 % p.a.', 'Praha', NULL, 'Praha 3 – Žižkov', 'Hlavní město Praha', 50.0900, 14.4500, 1200, NULL, NULL, NULL, 2, 2, NULL, NULL, NULL, 2, 0, 6, 0, 5, 5, 3.2, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 1925, NULL, NULL, '["12 bytových jednotek","2 komerční prostory","Výnos 5,8 % p.a.","Plně pronajato","Dobrý stav","Potenciál rekonstrukce","Metro A – Flora","Klidná ulice"]');

-- 16) Hotel Plzeň-centrum
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Hotel Plzeň-centrum', 1, 4, 29, 62000000, 1, 1, E'Tříhvězdičkový hotel v historickém centru Plzně s 45 pokoji, restaurací a konferenčním sálem. Hotel je v provozu s ustálenou klientelou.\n\nBudova prošla rekonstrukcí v roce 2018. Součástí je podzemní garáž pro 20 vozidel a zahrádka.', 'Plzeň', NULL, 'Plzeň-centrum', 'Plzeňský kraj', 49.7476, 13.3776, 2800, NULL, NULL, NULL, 9, 2, NULL, NULL, 1, 1, 1, 3, 1, 3, 4, 3.0, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 1935, 2018, NULL, '["45 pokojů","Restaurace","Konferenční sál","Podzemní garáž 20 míst","Recepce 24/7","Wi-Fi","Zahrádka","V provozu"]');

-- 17) Virtuální kancelář Praha 2
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Virtuální kancelář Praha 2', 2, 4, 49, 3500, 1, 2, E'Prestižní virtuální kancelář na Vinohradech s adresou pro sídlo firmy, přijímáním pošty a přístupem do zasedacích místností. Ideální pro freelancery, startupy a firmy bez potřeby stálých kancelářských prostor.\n\nSlužby zahrnují přeposílání pošty, telefonní linku a možnost pronájmu zasedací místnosti na hodiny.', 'Praha', NULL, 'Praha 2 – Vinohrady', 'Hlavní město Praha', 50.0750, 14.4380, 0, NULL, NULL, NULL, 1, 2, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 2010, 2022, NULL, '["Sídlo firmy","Přijímání pošty","Přeposílání pošty","Zasedací místnost","Telefonní linka","Prestižní adresa","Metro A – Náměstí Míru"]');

-- 18) Zemědělský areál Olomouc
INSERT INTO listings (title, advert_function, advert_type, advert_subtype, advert_price, advert_price_currency, advert_price_unit, description, locality_city, locality_street, locality_citypart, locality_region, locality_latitude, locality_longitude, usable_area, estate_area, office_area, min_divisible_area, building_condition, building_type, building_class, certification, furnished, elevator, parking_lots, parking_type, garage, energy_efficiency_rating, floors, ceiling_height, floor_load, sprinkler_type, heating_type, loading_docks, dock_type, drive_in_gates, crane_capacity, column_grid, lease_type, available_from, land_type, utilities, rail_access, highway_distance, year_built, year_renovated, extra_info, features) VALUES
('Zemědělský areál Olomouc', 1, 4, 31, 18500000, 1, 1, E'Zemědělský areál v úrodné Hané u Olomouce. Součástí je zemědělská hala, sila, strojovna a administrativní budova. Pozemek o rozloze 35 000 m² včetně přilehlých polí.\n\nAreál je vhodný pro rostlinnou výrobu, skladování zemědělských komodit nebo přestavbu na komerční využití.', 'Olomouc', NULL, 'Olomouc-okolí', 'Olomoucký kraj', 49.5938, 17.2509, 4200, 35000, NULL, NULL, 8, 7, NULL, NULL, NULL, 2, 1, 1, 1, 6, 1, 6.0, NULL, NULL, 7, 0, NULL, 0, NULL, NULL, NULL, NULL, 4, '[1,3,7]', 0, 12.0, 1985, NULL, NULL, '["Zemědělská hala","Sila","Strojovna","Administrativní budova","Pozemek 35 000 m²","Příjezdová komunikace","Elektřina 400V","Studna"]');


-- ============================================================
-- LISTING IMAGES (54 rows total)
-- ============================================================

-- Listing 1
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80', 'Logistický park exteriér', 1, 0),
(1, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80', 'Interiér skladu', 0, 1),
(1, 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80', 'Nakládací rampy', 0, 2),
(1, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'Areál', 0, 3);

-- Listing 2
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(2, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'Kancelářský komplex', 1, 0),
(2, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'Open space', 0, 1),
(2, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80', 'Zasedací místnost', 0, 2);

-- Listing 3
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(3, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80', 'Výrobní hala', 1, 0),
(3, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'Výrobní prostor', 0, 1),
(3, 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80', 'Areál', 0, 2);

-- Listing 4
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(4, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80', 'Skladový areál', 1, 0),
(4, 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80', 'Sklad interiér', 0, 1),
(4, 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80', 'Exteriér', 0, 2);

-- Listing 5
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(5, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'Kanceláře', 1, 0),
(5, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'Open plan', 0, 1),
(5, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', 'Lobby', 0, 2);

-- Listing 6
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(6, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', 'Pozemek', 1, 0),
(6, 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80', 'Pohled na pozemek', 0, 1),
(6, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', 'Okolí', 0, 2);

-- Listing 7
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(7, 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80', 'Distribuční centrum', 1, 0),
(7, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80', 'Vnitřní prostor', 0, 1),
(7, 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80', 'Exteriér', 0, 2);

-- Listing 8
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(8, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80', 'Kancelář', 1, 0),
(8, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'Pracovní prostor', 0, 1),
(8, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'Budova', 0, 2);

-- Listing 9
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(9, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'Výrobní areál', 1, 0),
(9, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80', 'Výrobní hala', 0, 1),
(9, 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80', 'Areál', 0, 2);

-- Listing 10
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(10, 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80', 'Pozemek', 1, 0),
(10, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', 'Pohled', 0, 1),
(10, 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80', 'Okolí', 0, 2);

-- Listing 11
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(11, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80', 'Logistický hub', 1, 0),
(11, 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80', 'Sklad', 0, 1),
(11, 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80', 'Areál', 0, 2);

-- Listing 12
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(12, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', 'Flex kanceláře', 1, 0),
(12, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'Coworking', 0, 1),
(12, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80', 'Zasedačka', 0, 2);

-- Listing 13
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(13, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', 'Obchodní prostor', 1, 0),
(13, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'Interiér', 0, 1),
(13, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80', 'Detail', 0, 2);

-- Listing 14
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(14, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', 'Restaurace', 1, 0),
(14, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'Interiér restaurace', 0, 1),
(14, 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80', 'Bar', 0, 2);

-- Listing 15
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(15, 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', 'Činžovní dům', 1, 0),
(15, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'Interiér', 0, 1),
(15, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'Detail', 0, 2);

-- Listing 16
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(16, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'Hotel', 1, 0),
(16, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', 'Pokoj', 0, 1),
(16, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', 'Restaurace', 0, 2);

-- Listing 17
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(17, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'Kancelář', 1, 0),
(17, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'Zasedačka', 0, 1),
(17, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80', 'Prostor', 0, 2);

-- Listing 18
INSERT INTO listing_images (listing_id, url, alt, is_main, sort_order) VALUES
(18, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', 'Zemědělský areál', 1, 0),
(18, 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80', 'Pole', 0, 1),
(18, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'Hala', 0, 2);

COMMIT;
