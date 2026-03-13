import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSearch } from "../lib/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await fetchSearch(query);
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      setOpen(false);
      if (query.trim()) {
        navigate(`/nabidky?q=${encodeURIComponent(query.trim())}`);
        setQuery("");
      }
    }
  }

  function handleResultClick(id) {
    setOpen(false);
    setQuery("");
    navigate(`/detail/${id}`);
  }

  return (
    <div className="search-bar" ref={wrapRef}>
      <div className="search-bar__input-wrap">
        <svg
          className="search-bar__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-bar__input"
          type="text"
          placeholder="Hledat nemovitosti..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && results.length > 0 && (
        <div className="search-bar__dropdown">
          {results.map((r) => {
            const isRent = r.advert_function === 2;
            return (
              <div
                key={r.id}
                className="search-bar__result"
                onClick={() => handleResultClick(r.id)}
              >
                <div>
                  <div className="search-bar__result-title">{r.title}</div>
                  <div className="search-bar__result-city">
                    {r.locality_city}
                  </div>
                </div>
                <span
                  className={`search-bar__result-badge ${
                    isRent
                      ? "search-bar__result-badge--rent"
                      : "search-bar__result-badge--sale"
                  }`}
                >
                  {isRent ? "Pronajem" : "Prodej"}
                </span>
              </div>
            );
          })}
          <div className="search-bar__hint">
            Stisknete Enter pro zobrazeni vsech vysledku
          </div>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="search-bar__dropdown">
          <div className="search-bar__hint">Zadne vysledky</div>
        </div>
      )}
    </div>
  );
}
