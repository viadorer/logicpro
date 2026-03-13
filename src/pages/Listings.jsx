import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";
import FilterSidebar from "../components/FilterSidebar";
import MapListings from "../components/MapListings";

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => Object.fromEntries(searchParams.entries()));
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid | map
  const { user } = useAuth();

  const loadListings = useCallback(async (f) => {
    setLoading(true);
    try {
      const data = await fetchListings(f);
      setListings(data.listings);
      setTotal(data.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Sync filters from URL (including q param)
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.set(k, v);
    }
    setSearchParams(params, { replace: true });
    loadListings(filters);
  }, [filters, setSearchParams, loadListings]);

  // Sync q param from URL into filters on mount / URL change
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== filters.q) {
      setFilters((prev) => ({ ...prev, q }));
    }
  }, [searchParams]);

  const hasActiveFilters = Object.values(filters).some((v) => v);

  async function handleSaveSearch() {
    const name = window.prompt("Název hledání:");
    if (!name) return;
    await supabase.from("saved_searches").insert({
      user_id: user.id,
      name,
      filters,
    });
  }

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href="/">Domů</a><span>/</span><span>Nabídka prostor</span>
          </div>
          <span className="label">Nabídka prostor</span>
          <h1 className="h2">Najděte ideální <em>prostory</em></h1>
          <p className="page-hero__sub">Prohlédněte si naši aktuální nabídku komerčních nemovitostí v České republice a regionu CEE.</p>
        </div>
      </section>

      <section className="listings-page">
        <div className="wrap listings-page__inner">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          <div className="listings-page__content">
            <div className="listings-page__toolbar">
              <span className="listings-page__count">
                Nalezeno <strong>{total}</strong> nemovitostí
              </span>
              <div className="listings-page__actions">
                {user && hasActiveFilters && (
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={handleSaveSearch}
                  >
                    Uložit hledání
                  </button>
                )}
                <button
                  id="filterToggle"
                  className="btn btn--outline btn--sm"
                  onClick={() => setFilterOpen(true)}
                >
                  Filtry
                </button>
                <div className="view-toggle">
                  <button
                    className={`view-toggle__btn${viewMode === "grid" ? " active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Grid"
                  >
                    &#9638;&#9638;
                  </button>
                  <button
                    className={`view-toggle__btn${viewMode === "map" ? " active" : ""}`}
                    onClick={() => setViewMode("map")}
                    title="Mapa"
                  >
                    &#9873;
                  </button>
                </div>
              </div>
            </div>

            {viewMode === "grid" ? (
              <>
                {loading ? (
                  <div className="listings__grid--page">
                    <div className="loader"><div className="loader__spinner" /></div>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="listings__empty">
                    <div className="listings__empty-icon">&#128269;</div>
                    <h3>Žádné výsledky</h3>
                    <p>Zkuste změnit filtry nebo vyhledat jinak.</p>
                  </div>
                ) : (
                  <div className="listings__grid--page">
                    {listings.map((l) => <Card key={l.id} listing={l} />)}
                  </div>
                )}
              </>
            ) : (
              <MapListings listings={listings} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
