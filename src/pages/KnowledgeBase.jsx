import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  KB_CATEGORIES,
  getTermsByCategory,
  searchTerms,
} from "../lib/knowledgeBase";

export default function KnowledgeBase() {
  const [params, setParams] = useSearchParams();
  const activeCat = params.get("kategorie") || null;
  const [search, setSearch] = useState("");
  const [openSlug, setOpenSlug] = useState(null);

  const category = KB_CATEGORIES.find((c) => c.id === activeCat);

  const terms = useMemo(() => {
    if (search.trim().length >= 2) return searchTerms(search);
    if (activeCat) return getTermsByCategory(activeCat);
    return [];
  }, [activeCat, search]);

  const showCategories = !activeCat && search.trim().length < 2;

  function selectCategory(id) {
    setSearch("");
    setOpenSlug(null);
    setParams({ kategorie: id });
  }

  function clearCategory() {
    setSearch("");
    setOpenSlug(null);
    setParams({});
  }

  return (
    <main className="kb">
      <div className="wrap">
        {/* Hero */}
        <section className="kb__hero">
          <span className="label">Knowledge Base</span>
          <h1 className="h2">
            Slovník pojmů z&nbsp;<em>komerčních nemovitostí</em>
          </h1>
          <p className="kb__subtitle">
            Vysvětlení termínů, zkratek a výrazů, které potkáte při pronájmu,
            investicích i správě komerčních prostor.
          </p>

          {/* Search */}
          <div className="kb__search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Hledat pojem…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="kb__search-input"
            />
            {search && (
              <button className="kb__search-clear" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Breadcrumb when in category */}
        {activeCat && !search && (
          <nav className="kb__breadcrumb">
            <button onClick={clearCategory} className="kb__breadcrumb-link">
              Knowledge Base
            </button>
            <span className="kb__breadcrumb-sep">›</span>
            <span>{category?.title}</span>
          </nav>
        )}

        {/* Search results indicator */}
        {search.trim().length >= 2 && (
          <p className="kb__results-count">
            {terms.length === 0
              ? "Žádné výsledky"
              : `${terms.length} ${terms.length === 1 ? "výsledek" : terms.length < 5 ? "výsledky" : "výsledků"} pro „${search}"`}
          </p>
        )}

        {/* Category Grid */}
        {showCategories && (
          <section className="kb__categories">
            {KB_CATEGORIES.map((cat) => {
              const count = getTermsByCategory(cat.id).length;
              return (
                <button
                  key={cat.id}
                  className="kb__cat-card"
                  onClick={() => selectCategory(cat.id)}
                  style={{ "--cat-color": cat.color }}
                >
                  <div className="kb__cat-icon">{cat.abbr}</div>
                  <div className="kb__cat-info">
                    <h3>{cat.title}</h3>
                    <p>{cat.desc}</p>
                  </div>
                  <div className="kb__cat-meta">
                    <span className="kb__cat-count">{count} pojmů</span>
                    <span className="kb__cat-arrow">→</span>
                  </div>
                </button>
              );
            })}
          </section>
        )}

        {/* Terms List */}
        {terms.length > 0 && (
          <section className="kb__terms">
            {activeCat && !search && (
              <div className="kb__cat-header" style={{ "--cat-color": category?.color }}>
                <span className="kb__cat-header-icon">{category?.abbr}</span>
                <div>
                  <h2>{category?.title}</h2>
                  <p>{category?.desc}</p>
                </div>
              </div>
            )}

            <div className="kb__term-list">
              {terms.map((t) => {
                const isOpen = openSlug === t.slug;
                const cat = KB_CATEGORIES.find((c) => c.id === t.cat);
                return (
                  <div
                    key={t.slug}
                    className={`kb__term ${isOpen ? "kb__term--open" : ""}`}
                    style={{ "--cat-color": cat?.color }}
                  >
                    <button
                      className="kb__term-header"
                      onClick={() => setOpenSlug(isOpen ? null : t.slug)}
                    >
                      <div className="kb__term-title">
                        <span className="kb__term-dot" />
                        <h3>{t.term}</h3>
                        {search && (
                          <span className="kb__term-cat-badge">{cat?.title}</span>
                        )}
                      </div>
                      <span className={`kb__term-chevron ${isOpen ? "kb__term-chevron--open" : ""}`}>
                        ‹
                      </span>
                    </button>
                    {isOpen && (
                      <div className="kb__term-body">
                        <p>{t.def}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state for category with no search */}
        {!showCategories && terms.length === 0 && search.trim().length < 2 && (
          <p className="kb__empty">Vyberte kategorii nebo vyhledejte pojem.</p>
        )}
      </div>
    </main>
  );
}
