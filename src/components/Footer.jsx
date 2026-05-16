import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { profile } = useAuth();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="logo">
              <span className="logo__lp">Logic</span>
              <span className="logo__pro">Pro</span>
              <span className="logo__dot" />
            </Link>
            <p>Poradenství a služby v oblasti komerčních nemovitostí v CEE regionu.</p>
          </div>
          <div className="footer__col">
            <strong>Služby</strong>
            <Link to="/#sluzby">Zastupování nájemce</Link>
            <Link to="/#sluzby">Zastupování vlastníka</Link>
            <Link to="/#sluzby">Investiční poradenství</Link>
            <Link to="/#sluzby">Ocenění</Link>
          </div>
          <div className="footer__col">
            <strong>Nemovitosti</strong>
            <Link to="/nabidky?advert_subtype=26,27">Průmyslové</Link>
            <Link to="/nabidky?advert_subtype=25">Kancelářské</Link>
            <Link to="/nabidky?advert_subtype=28">Obchodní</Link>
            <Link to="/nabidky?advert_function=1">Investiční</Link>
          </div>
          <div className="footer__col">
            <strong>Zdroje</strong>
            <Link to="/knowledge-base">Knowledge Base</Link>
            <Link to="/#z-trhu">Z trhu</Link>
            <Link to="/#kontakt">Kariéra</Link>
          </div>
          <div className="footer__col">
            <strong>Kontakt</strong>
            <a href="mailto:info@logicpro.cz">info@logicpro.cz</a>
            <a href="tel:+420224835000">+420 224 835 000</a>
            <span>Praha 1, Národní 10</span>
          </div>
        </div>
        <div className="footer__bot">
          <span>&copy; {new Date().getFullYear()} LogicPro. Všechna práva vyhrazena.</span>
          <div className="footer__soc">
            <Link to="/ochrana-osobnich-udaju">Ochrana osobních údajů</Link>
            <Link to="/obchodni-podminky">Obchodní podmínky</Link>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            {profile?.role === "admin" && (
              <Link to="/admin" className="footer__admin-link">Administrace</Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
