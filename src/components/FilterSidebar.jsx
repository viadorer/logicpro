import { useCallback, useRef } from "react";

const SUBTYPES = [
  { value: "26,50", label: "Sklady / Logistika" },
  { value: "25,53", label: "Kanceláře" },
  { value: "27", label: "Výroba" },
  { value: "28,51", label: "Obchodní / Retail" },
  { value: "30,29", label: "Ubyt. / Rest." },
  { value: "38,54", label: "Činžovní / Polyfunkční" },
];

const CITIES = ["Praha", "Brno", "Ostrava", "Plzeň", "Olomouc"];

export default function FilterSidebar({ filters, onChange, open, onClose }) {
  const debounceRef = useRef(null);

  const setFilter = useCallback((key, value) => {
    onChange((prev) => {
      const next = { ...prev };
      if (value === null || value === prev[key]) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, [onChange]);

  const handleRange = useCallback((key, value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setFilter(key, value || null), 400);
  }, [setFilter]);

  const reset = () => onChange({});

  return (
    <aside className={`filter-sidebar glass${open ? " filter-sidebar--open" : ""}`}>
      <div className="filter-sidebar__header">
        <h3>Filtry</h3>
        <button className="filter-sidebar__close" onClick={onClose}>&times;</button>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Typ</span>
        <div className="filter-group__chips">
          <Chip active={!filters.advert_function} onClick={() => setFilter("advert_function", null)}>Vše</Chip>
          <Chip active={filters.advert_function === "2"} onClick={() => setFilter("advert_function", "2")}>Pronájem</Chip>
          <Chip active={filters.advert_function === "1"} onClick={() => setFilter("advert_function", "1")}>Prodej</Chip>
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Kategorie</span>
        <div className="filter-group__chips">
          <Chip active={!filters.advert_subtype} onClick={() => setFilter("advert_subtype", null)}>Vše</Chip>
          {SUBTYPES.map((s) => (
            <Chip key={s.value} active={filters.advert_subtype === s.value} onClick={() => setFilter("advert_subtype", s.value)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Lokalita</span>
        <div className="filter-group__chips">
          <Chip active={!filters.locality_city} onClick={() => setFilter("locality_city", null)}>Vše</Chip>
          {CITIES.map((c) => (
            <Chip key={c} active={filters.locality_city === c} onClick={() => setFilter("locality_city", c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Plocha (m2)</span>
        <div className="filter-range">
          <input className="filter-input" type="number" placeholder="Od" defaultValue={filters.area_min || ""} onChange={(e) => handleRange("area_min", e.target.value)} />
          <span>&mdash;</span>
          <input className="filter-input" type="number" placeholder="Do" defaultValue={filters.area_max || ""} onChange={(e) => handleRange("area_max", e.target.value)} />
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Třída budovy</span>
        <div className="filter-group__chips">
          <Chip active={!filters.building_class} onClick={() => setFilter("building_class", null)}>Vše</Chip>
          <Chip active={filters.building_class === "1"} onClick={() => setFilter("building_class", "1")}>A</Chip>
          <Chip active={filters.building_class === "2"} onClick={() => setFilter("building_class", "2")}>B</Chip>
          <Chip active={filters.building_class === "3"} onClick={() => setFilter("building_class", "3")}>C</Chip>
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Světlá výška (m)</span>
        <div className="filter-range">
          <input className="filter-input" type="number" placeholder="Od" step="0.5" defaultValue={filters.ceiling_height_min || ""} onChange={(e) => handleRange("ceiling_height_min", e.target.value)} />
          <span>&mdash;</span>
          <input className="filter-input" type="number" placeholder="Do" step="0.5" defaultValue={filters.ceiling_height_max || ""} onChange={(e) => handleRange("ceiling_height_max", e.target.value)} />
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Únosnost podlahy</span>
        <div className="filter-group__chips">
          <Chip active={!filters.floor_load} onClick={() => setFilter("floor_load", null)}>Vše</Chip>
          <Chip active={filters.floor_load === "2"} onClick={() => setFilter("floor_load", "2")}>3+ t/m2</Chip>
          <Chip active={filters.floor_load === "3"} onClick={() => setFilter("floor_load", "3")}>5+ t/m2</Chip>
          <Chip active={filters.floor_load === "5"} onClick={() => setFilter("floor_load", "5")}>10+ t/m2</Chip>
        </div>
      </div>

      <button className="btn btn--outline btn--full btn--sm" onClick={reset}>Resetovat filtry</button>
    </aside>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button className={`chip--filter${active ? " active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
