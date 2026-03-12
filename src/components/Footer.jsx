import { Link } from "react-router-dom";

export default function Footer() {
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
            <Link to="/">Zastupování nájemce</Link>
            <Link to="/">Zastupování vlastníka</Link>
            <Link to="/">Investiční poradenství</Link>
            <Link to="/">Ocenění</Link>
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
            <Link to="/">Z trhu</Link>
            <Link to="/">Kariéra</Link>
          </div>
          <div className="footer__col">
            <strong>Kontakt</strong>
            <a href="mailto:info@logicpro.cz">info@logicpro.cz</a>
            <a href="tel:+420224835000">+420 224 835 000</a>
            <span>Praha 1, Národní 10</span>
          </div>
        </div>
        <div className="footer__bot">
          <span>&copy; 2025 LogicPro. Všechna práva vyhrazena.</span>
          <div className="footer__soc">
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
