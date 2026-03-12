import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setNavOpen(false), [loc]);

  return (
    <header className={`header${scrolled ? " header--shadow" : ""}`}>
      <div className="wrap header__inner">
        <Link to="/" className="logo">
          <span className="logo__lp">Logic</span>
          <span className="logo__pro">Pro</span>
          <span className="logo__dot" />
        </Link>
        <nav className={`nav${navOpen ? " nav--open" : ""}`}>
          <Link to="/" className="nav__link">Služby</Link>
          <Link to="/nabidky" className="nav__link">Nemovitosti</Link>
          <Link to="/" className="nav__link">Z trhu</Link>
          <Link to="/" className="nav__link">Reference</Link>
          <Link to="/" className="nav__link">Kontakt</Link>
        </nav>
        <div className="header__r">
          <span className="header__tel">+420 224 835 000</span>
          <Link to="/nabidky" className="btn btn--sm btn--fill">Poptávka</Link>
          <button className="burger" onClick={() => setNavOpen(!navOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
