import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CODEBOOKS } from "../../lib/codebooks";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, locality_city, advert_subtype, advert_price, advert_function")
      .order("id", { ascending: false });
    if (!error && data) setListings(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Opravdu chcete smazat tuto nemovitost?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
  }

  function formatPrice(price) {
    if (!price) return "-";
    return Math.round(price).toLocaleString("cs-CZ") + " CZK";
  }

  return (
    <div>
      <h1 className="admin__page-title">Sprava nemovitosti</h1>
      <p className="admin__page-subtitle">
        Celkem: {listings.length} nemovitosti
      </p>

      {loading ? (
        <div className="loader">
          <div className="loader__spinner" />
        </div>
      ) : (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nazev</th>
                <th>Mesto</th>
                <th>Typ</th>
                <th>Cena</th>
                <th>Stav</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.title || "-"}</td>
                  <td>{l.locality_city || "-"}</td>
                  <td>{CODEBOOKS.advert_subtype[l.advert_subtype] || "-"}</td>
                  <td className="admin__badge--price">
                    {formatPrice(l.advert_price)}
                  </td>
                  <td>
                    <span className="admin__badge admin__badge--active">
                      Aktivni
                    </span>
                  </td>
                  <td>
                    <div className="admin__table-actions">
                      <Link
                        to={"/admin/inzerat/" + l.id}
                        className="admin__table-btn admin__table-btn--edit"
                      >
                        Upravit
                      </Link>
                      <button
                        type="button"
                        className="admin__table-btn admin__table-btn--del"
                        onClick={() => handleDelete(l.id)}
                      >
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                    Zadne nemovitosti
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
