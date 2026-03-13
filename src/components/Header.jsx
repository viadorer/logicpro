import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setNavOpen(false), [loc]);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "Ucet";

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <header className={`header${scrolled ? " header--shadow" : ""}`}>
      <div className="wrap header__inner">
        <Link to="/" className="logo">
          <span className="logo__lp">Logic</span>
          <span className="logo__pro">Pro</span>
          <span className="logo__dot" />
        </Link>
        <nav className={`nav${navOpen ? " nav--open" : ""}`}>
          <Link to="/" className="nav__link">Sluzby</Link>
          <Link to="/nabidky" className="nav__link">Nemovitosti</Link>
          <Link to="/" className="nav__link">Z trhu</Link>
          <Link to="/" className="nav__link">Reference</Link>
          <Link to="/" className="nav__link">Kontakt</Link>
        </nav>
        <SearchBar />
        <div className="header__r">
          <span className="header__tel">+420 224 835 000</span>
          {user ? (
            <>
              <Link to="/profil" className="btn btn--outline btn--sm">
                {displayName}
              </Link>
              <button
                className="btn btn--sm"
                onClick={handleSignOut}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                Odhlasit se
              </button>
            </>
          ) : (
            <Link to="/prihlaseni" className="btn btn--sm btn--fill">
              Prihlaseni
            </Link>
          )}
          <button className="burger" onClick={() => setNavOpen(!navOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
