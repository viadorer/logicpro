import { CODEBOOKS, formatPrice, formatArea } from "../lib/codebooks";

export default function ParamsGrid({ listing: l }) {
  const items = [];

  const area = formatArea(l);
  if (area) items.push({ label: "Plocha", value: area });

  items.push({ label: "Cena", value: formatPrice(l), accent: true });

  if (l.building_condition) items.push({ label: "Stav", value: CODEBOOKS.building_condition[l.building_condition] });
  if (l.energy_efficiency_rating) items.push({ label: "Energetika", value: CODEBOOKS.energy_efficiency_rating[l.energy_efficiency_rating] });
  if (l.ceiling_height) items.push({ label: "Výška", value: `${l.ceiling_height} m` });
  if (l.floors) items.push({ label: "Podlaží", value: l.floors });

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
