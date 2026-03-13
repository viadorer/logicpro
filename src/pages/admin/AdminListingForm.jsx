import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CODEBOOKS } from "../../lib/codebooks";
import ImageUpload from "../../components/admin/ImageUpload";

const EMPTY = {
  title: "",
  advert_function: "",
  advert_subtype: "",
  advert_price: "",
  locality_city: "",
  locality_citypart: "",
  locality_region: "",
  locality_latitude: "",
  locality_longitude: "",
  area: "",
  usable_area: "",
  office_area: "",
  floor_area: "",
  land_area: "",
  min_divisible_area: "",
  floors: "",
  ceiling_height: "",
  parking_lots: "",
  garage: "",
  building_class: "",
  certification: "",
  floor_load: "",
  sprinkler_type: "",
  heating_type: "",
  parking_type: "",
  loading_docks: "",
  dock_type: "",
  drive_in_gates: "",
  crane_capacity: "",
  column_grid: "",
  lease_type: "",
  land_type: "",
  rail_access: 0,
  highway_distance: "",
  year_built: "",
  year_renovated: "",
  description: "",
  features: "",
};

function toNum(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export default function AdminListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const imageUploadRef = useRef();

  const isEdit = !!id;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();
      if (err || !data) {
        setError("Nemovitost nebyla nalezena.");
        setLoading(false);
        return;
      }
      const filled = { ...EMPTY };
      for (const key of Object.keys(EMPTY)) {
        if (data[key] !== null && data[key] !== undefined) {
          if (key === "features") {
            filled[key] = Array.isArray(data[key])
              ? data[key].join("\n")
              : String(data[key] || "");
          } else {
            filled[key] = data[key];
          }
        }
      }
      setForm(filled);
      setLoading(false);
    })();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {};
    for (const [key, val] of Object.entries(form)) {
      if (key === "features") {
        const lines = String(val || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        payload[key] = lines.length > 0 ? lines : null;
      } else if (
        [
          "advert_function",
          "advert_subtype",
          "advert_price",
          "locality_latitude",
          "locality_longitude",
          "area",
          "usable_area",
          "office_area",
          "floor_area",
          "land_area",
          "min_divisible_area",
          "floors",
          "ceiling_height",
          "parking_lots",
          "garage",
          "building_class",
          "certification",
          "floor_load",
          "sprinkler_type",
          "heating_type",
          "parking_type",
          "loading_docks",
          "dock_type",
          "drive_in_gates",
          "crane_capacity",
          "lease_type",
          "land_type",
          "rail_access",
          "highway_distance",
          "year_built",
          "year_renovated",
        ].includes(key)
      ) {
        payload[key] = toNum(val);
      } else {
        payload[key] = val === "" ? null : val;
      }
    }

    let savedId = id ? Number(id) : null;

    if (isEdit) {
      const { error: err } = await supabase
        .from("listings")
        .update(payload)
        .eq("id", id);
      if (err) {
        setError("Chyba pri ukladani: " + err.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error: err } = await supabase
        .from("listings")
        .insert(payload)
        .select()
        .single();
      if (err) {
        setError("Chyba pri vytvareni: " + err.message);
        setSaving(false);
        return;
      }
      savedId = data.id;
    }

    // Upload pending images
    if (imageUploadRef.current && imageUploadRef.current.uploadPending) {
      await imageUploadRef.current.uploadPending(savedId);
    }

    setSaving(false);
    navigate("/admin");
  }

  function renderSelect(name, codebook, label) {
    return (
      <div className="admin__form-group">
        <label className="admin__form-label">{label}</label>
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="admin__form-select"
        >
          <option value="">-- vyberte --</option>
          {Object.entries(codebook).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderInput(name, label, type = "text", extra = {}) {
    return (
      <div className={"admin__form-group" + (extra.full ? " admin__form-group--full" : "")}>
        <label className="admin__form-label">{label}</label>
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="admin__form-input"
          step={extra.step}
          placeholder={extra.placeholder}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="loader__spinner" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="admin__page-title">
        {isEdit ? "Upravit inzerat #" + id : "Novy inzerat"}
      </h1>
      <p className="admin__page-subtitle">
        {isEdit
          ? "Upravte udaje nemovitosti a ulozte zmeny."
          : "Vyplnte udaje a vytvorte novy inzerat."}
      </p>

      {error && <div className="admin__form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin__form">
        {/* Zakladni udaje */}
        <div className="admin__fieldset">
          <div className="admin__fieldset-title">Zakladni udaje</div>
          <div className="admin__form-grid">
            <div className="admin__form-group admin__form-group--full">
              <label className="admin__form-label">Nazev</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="admin__form-input"
                required
              />
            </div>
            {renderSelect("advert_function", CODEBOOKS.advert_function, "Typ nabidky")}
            {renderSelect("advert_subtype", CODEBOOKS.advert_subtype, "Podtyp")}
            {renderInput("advert_price", "Cena", "number")}
          </div>
        </div>

        {/* Lokace */}
        <div className="admin__fieldset">
          <div className="admin__fieldset-title">Lokace</div>
          <div className="admin__form-grid">
            {renderInput("locality_city", "Mesto")}
            {renderInput("locality_citypart", "Mestska cast")}
            {renderInput("locality_region", "Region")}
            {renderInput("locality_latitude", "Zemepisna sirka", "number", { step: "0.0001" })}
            {renderInput("locality_longitude", "Zemepisna delka", "number", { step: "0.0001" })}
          </div>
        </div>

        {/* Parametry nemovitosti */}
        <div className="admin__fieldset">
          <div className="admin__fieldset-title">Parametry nemovitosti</div>
          <div className="admin__form-grid">
            {renderInput("area", "Plocha (m2)", "number")}
            {renderInput("usable_area", "Uzitna plocha (m2)", "number")}
            {renderInput("office_area", "Kancelarska plocha (m2)", "number")}
            {renderInput("floor_area", "Podlahova plocha (m2)", "number")}
            {renderInput("land_area", "Plocha pozemku (m2)", "number")}
            {renderInput("min_divisible_area", "Min. delitelna plocha (m2)", "number")}
            {renderInput("floors", "Pocet pater", "number")}
            {renderInput("ceiling_height", "Vyska stropu (m)", "number", { step: "0.1" })}
            {renderInput("parking_lots", "Parkovaci mista", "number")}
            {renderInput("garage", "Garaze", "number")}
          </div>
        </div>

        {/* CRE specificke */}
        <div className="admin__fieldset">
          <div className="admin__fieldset-title">CRE specificke</div>
          <div className="admin__form-grid">
            {renderSelect("building_class", CODEBOOKS.building_class, "Trida budovy")}
            {renderSelect("certification", CODEBOOKS.certification, "Certifikace")}
            {renderSelect("floor_load", CODEBOOKS.floor_load, "Nosnost podlahy")}
            {renderSelect("sprinkler_type", CODEBOOKS.sprinkler_type, "Typ sprinkleru")}
            {renderSelect("heating_type", CODEBOOKS.heating_type, "Vytapeni")}
            {renderSelect("parking_type", CODEBOOKS.parking_type, "Typ parkovani")}
            {renderInput("loading_docks", "Nakladaci rampy", "number")}
            {renderSelect("dock_type", CODEBOOKS.dock_type, "Typ rampy")}
            {renderInput("drive_in_gates", "Drive-in vrata", "number")}
            {renderInput("crane_capacity", "Kapacita jeraba (t)", "number", { step: "0.1" })}
            {renderInput("column_grid", "Sloupovy rastr", "text", { placeholder: "napr. 12x24m" })}
            {renderSelect("lease_type", CODEBOOKS.lease_type, "Typ najmu")}
            {renderSelect("land_type", CODEBOOKS.land_type, "Typ pozemku")}
            <div className="admin__form-group">
              <label className="admin__form-check">
                <input
                  type="checkbox"
                  name="rail_access"
                  checked={form.rail_access === 1}
                  onChange={handleChange}
                />
                Vlecka / zeleznicni pristup
              </label>
            </div>
            {renderInput("highway_distance", "Vzdalenost dalnice (km)", "number", { step: "0.1" })}
            {renderInput("year_built", "Rok vystavby", "number")}
            {renderInput("year_renovated", "Rok rekonstrukce", "number")}
          </div>
        </div>

        {/* Popis */}
        <div className="admin__fieldset">
          <div className="admin__fieldset-title">Popis</div>
          <div className="admin__form-grid">
            <div className="admin__form-group admin__form-group--full">
              <label className="admin__form-label">Popis nemovitosti</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="admin__form-textarea"
                rows={8}
              />
            </div>
            <div className="admin__form-group admin__form-group--full">
              <label className="admin__form-label">
                Vybaveni (jedna polozka na radek)
              </label>
              <textarea
                name="features"
                value={form.features}
                onChange={handleChange}
                className="admin__form-textarea"
                rows={5}
                placeholder={"Klimatizace\nVytah\nRecepce"}
              />
            </div>
          </div>
        </div>

        {/* Fotografie */}
        <div className="admin__fieldset">
          <div className="admin__fieldset-title">Fotografie</div>
          <ImageUpload ref={imageUploadRef} listingId={isEdit ? Number(id) : null} />
        </div>

        <button
          type="submit"
          className="btn btn--fill btn--lg btn--full"
          disabled={saving}
          style={{ marginTop: 8 }}
        >
          {saving ? "Ukladam..." : "Ulozit inzerat"}
        </button>
      </form>
    </div>
  );
}
