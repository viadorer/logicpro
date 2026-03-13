import { CODEBOOKS, formatPrice, formatArea } from "../lib/codebooks";

export default function ParamsGrid({ listing: l }) {
  const items = [];

  const area = formatArea(l);
  if (area) items.push({ label: "Plocha", value: area });
  if (l.office_area) items.push({ label: "Kancelářská plocha", value: `${l.office_area.toLocaleString("cs-CZ")} m²` });
  if (l.min_divisible_area) items.push({ label: "Min. dělitelnost", value: `${l.min_divisible_area.toLocaleString("cs-CZ")} m²` });
  if (l.estate_area && l.usable_area) items.push({ label: "Pozemek", value: `${l.estate_area.toLocaleString("cs-CZ")} m²` });

  items.push({ label: "Cena", value: formatPrice(l), accent: true });

  if (l.building_class) items.push({ label: "Třída", value: CODEBOOKS.building_class[l.building_class] });
  if (l.certification) items.push({ label: "Certifikace", value: CODEBOOKS.certification[l.certification] });
  if (l.building_condition) items.push({ label: "Stav", value: CODEBOOKS.building_condition[l.building_condition] });
  if (l.energy_efficiency_rating) items.push({ label: "Energetika", value: CODEBOOKS.energy_efficiency_rating[l.energy_efficiency_rating] });
  if (l.ceiling_height) items.push({ label: "Světlá výška", value: `${l.ceiling_height} m` });
  if (l.floor_load) items.push({ label: "Únosnost podlahy", value: CODEBOOKS.floor_load[l.floor_load] });
  if (l.floors) items.push({ label: "Podlaží", value: l.floors });
  if (l.column_grid) items.push({ label: "Sloupový rastr", value: l.column_grid });

  if (l.loading_docks) items.push({ label: "Nakládací doky", value: l.loading_docks });
  if (l.dock_type) items.push({ label: "Typ doků", value: CODEBOOKS.dock_type[l.dock_type] });
  if (l.drive_in_gates) items.push({ label: "Drive-in vrata", value: l.drive_in_gates });
  if (l.crane_capacity) items.push({ label: "Jeřáb", value: `${l.crane_capacity} t` });

  if (l.sprinkler_type) items.push({ label: "Sprinklery", value: CODEBOOKS.sprinkler_type[l.sprinkler_type] });
  if (l.heating_type) items.push({ label: "Vytápění", value: CODEBOOKS.heating_type[l.heating_type] });
  if (l.parking_type) items.push({ label: "Parkování", value: CODEBOOKS.parking_type[l.parking_type] });
  if (l.lease_type) items.push({ label: "Typ nájmu", value: CODEBOOKS.lease_type[l.lease_type] });

  if (l.land_type) items.push({ label: "Typ pozemku", value: CODEBOOKS.land_type[l.land_type] });
  if (l.highway_distance) items.push({ label: "Dálnice", value: `${l.highway_distance} km` });
  if (l.rail_access) items.push({ label: "Vlečka", value: "Ano" });
  if (l.year_built) items.push({ label: "Rok výstavby", value: l.year_built });
  if (l.year_renovated) items.push({ label: "Rok rekonstrukce", value: l.year_renovated });

  return (
    <div className="params">
      {items.map((it) => (
        <div key={it.label} className="params__item">
          <span className="params__label">{it.label}</span>
          <span className={`params__value${it.accent ? " params__value--accent" : ""}`}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}
