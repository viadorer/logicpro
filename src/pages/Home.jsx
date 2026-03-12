import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFeatured } from "../lib/api";
import Card from "../components/Card";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchFeatured().then((d) => setFeatured(d.listings)).catch(() => {});
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__text">
            <span className="chip">Komerční nemovitosti v CEE</span>
            <h1 className="hero__h">Místo, které dává<br />vašemu businessu<br /><em>smysl</em></h1>
            <p className="hero__p">Najdeme, vyjednáme a zajistíme prostory přesně pro vás. Průmysl, kanceláře, investice — 15 let na trhu, 10M+ m² zprostředkováno.</p>
            <div className="hero__btns">
              <a href="#sluzby" className="btn btn--fill btn--lg">Jak vám pomůžeme</a>
              <Link to="/nabidky" className="btn btn--outline btn--lg">Nabídka prostor</Link>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__img-main">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" alt="Moderní kancelářská budova" />
            </div>
            <div className="hero__img-sm hero__img-sm--1">
              <img src="https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=400&q=80" alt="Logistický sklad" />
            </div>
            <div className="hero__img-sm hero__img-sm--2">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" alt="Interiér kanceláře" />
            </div>
            <div className="hero__float glass">
              <strong>2 500+</strong>
              <span>spokojených klientů</span>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <section className="strip">
        <div className="wrap strip__inner">
          <div className="strip__item"><strong>2 500+</strong><span>klientů</span></div>
          <div className="strip__div" />
          <div className="strip__item"><strong>1 000+</strong><span>uzavřených smluv</span></div>
          <div className="strip__div" />
          <div className="strip__item"><strong>10+ mld</strong><span>hodnota transakcí</span></div>
          <div className="strip__div" />
          <div className="strip__item"><strong>15 let</strong><span>na trhu</span></div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="o-nas">
        <div className="wrap about__grid">
          <div className="about__img">
            <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=700&q=80" alt="Tým LogicPro" />
            <div className="about__badge glass">
              <strong>10M+</strong>
              <span>m² zprostředkováno v CEE</span>
            </div>
          </div>
          <div className="about__text">
            <span className="label">O společnosti</span>
            <h2 className="h2">Stovky úspěšných transakcí, jedno silné <em>know-how</em></h2>
            <p>Za posledních 15 let jsme v regionu střední a východní Evropy zprostředkovali více než 10 milionů m² komerčních nemovitostí.</p>
            <p>Mezi naše spokojené klienty patří Alza, Rohlik, Orlen, IKEA a další přední české i mezinárodní společnosti.</p>
            <div className="about__tags">
              <span>Česko</span><span>Slovensko</span><span>Maďarsko</span><span>Rumunsko</span><span>Region Adria</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES BENTO */}
      <section className="services" id="sluzby">
        <div className="wrap">
          <span className="label">Naše služby</span>
          <h2 className="h2">Co pro vás <em>uděláme</em></h2>
          <div className="bento">
            <div className="bento__card bento--tall bento--c1">
              <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80" alt="Pronájem" className="bento__bg" />
              <div className="bento__overlay" />
              <div className="bento__body"><span className="bento__num">01</span><h3>Pronájem prostor</h3><p>Průmyslové a kancelářské prostory v ČR i Evropě.</p></div>
            </div>
            <div className="bento__card bento--c2"><div className="bento__body"><span className="bento__num">02</span><h3>Prodej nemovitostí</h3><p>Komplexní servis při prodeji komerčních objektů.</p></div></div>
            <div className="bento__card bento--c3"><div className="bento__body"><span className="bento__num">03</span><h3>Pozemky</h3><p>Stavební pozemky pro komerční development.</p></div></div>
            <div className="bento__card bento--wide bento--c4">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Investice" className="bento__bg" />
              <div className="bento__overlay" />
              <div className="bento__body"><span className="bento__num">04</span><h3>Investice</h3><p>Poradenství při akvizicích v celém CEE regionu.</p></div>
            </div>
            <div className="bento__card bento--c5"><div className="bento__body"><span className="bento__num">05</span><h3>Průzkum trhu</h3><p>Analytické reporty a tržní data na míru.</p></div></div>
            <div className="bento__card bento--c6"><div className="bento__body"><span className="bento__num">06</span><h3>Správa nemovitostí</h3><p>Property a facility management.</p></div></div>
          </div>
        </div>
      </section>

      {/* PORTALS */}
      <section className="portals" id="nemovitosti">
        <div className="wrap">
          <span className="label">Nabídka prostor</span>
          <h2 className="h2">Vyberte si <em>sektor</em></h2>
          <div className="portals__grid">
            <Link to="/nabidky?advert_subtype=26,27" className="portal">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80" alt="Průmyslové prostory" className="portal__bg" />
              <div className="portal__overlay" /><div className="portal__body"><span className="portal__label">Průmyslové prostory</span><h3 className="portal__title">Sklady, haly<br />a výrobní prostory</h3><span className="portal__stat">1 483 324 m² ve výstavbě</span></div><span className="portal__arrow">&#8599;</span>
            </Link>
            <Link to="/nabidky?advert_subtype=25" className="portal">
              <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=700&q=80" alt="Kancelářské prostory" className="portal__bg" />
              <div className="portal__overlay" /><div className="portal__body"><span className="portal__label">Kancelářské prostory</span><h3 className="portal__title">Moderní kanceláře<br />v prémiových lokalitách</h3><span className="portal__stat">12 145 251 m² k pronájmu</span></div><span className="portal__arrow">&#8599;</span>
            </Link>
            <Link to="/nabidky?advert_subtype=31" className="portal portal--sm">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80" alt="Pozemky" className="portal__bg" />
              <div className="portal__overlay" /><div className="portal__body"><span className="portal__label">Pozemky</span><h3 className="portal__title">Stavební pozemky</h3></div><span className="portal__arrow">&#8599;</span>
            </Link>
            <Link to="/nabidky?advert_function=1" className="portal portal--sm">
              <img src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&q=80" alt="Investice" className="portal__bg" />
              <div className="portal__overlay" /><div className="portal__body"><span className="portal__label">Investiční příležitosti</span><h3 className="portal__title">Výnosnost 5–8 % p.a.</h3></div><span className="portal__arrow">&#8599;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="listings">
        <div className="wrap">
          <div className="listings__top">
            <div><span className="label">Doporučené</span><h2 className="h2">Vybrané <em>nemovitosti</em></h2></div>
            <Link to="/nabidky" className="btn btn--outline btn--sm">Zobrazit vše &rarr;</Link>
          </div>
          <div className="listings__grid">
            {featured.map((l) => <Card key={l.id} listing={l} />)}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="news" id="z-trhu">
        <div className="wrap">
          <span className="label">Nejnovější</span>
          <h2 className="h2">Z trhu</h2>
          <div className="news__grid">
            <a href="#" className="article article--feat">
              <div className="article__img"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" alt="Průmyslové nemovitosti" /></div>
              <div className="article__body">
                <div className="article__meta"><span className="chip chip--sm">Průmysl</span><span>2. 4. 2025</span></div>
                <h3>České průmyslové nemovitosti prudce modernizují</h3>
                <p>Přehled klíčových trendů a nová metodika hodnocení průmyslových prostor.</p>
              </div>
            </a>
            <div className="news__side">
              <a href="#" className="article article--row">
                <div className="article__body">
                  <div className="article__meta"><span className="chip chip--sm">Knowledge Base</span><span>15. 3. 2025</span></div>
                  <h3>RFI – průvodce výběrovým řízením</h3>
                </div>
              </a>
              <a href="#" className="article article--row">
                <div className="article__body">
                  <div className="article__meta"><span className="chip chip--sm">Reporty</span><span>1. 3. 2025</span></div>
                  <h3>Trh kancelářských prostor Q1 2025</h3>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section className="clients" id="reference">
        <div className="wrap">
          <span className="label">Důvěřují nám</span>
          <h2 className="h2">Naši <em>klienti</em></h2>
          <div className="clients__grid">
            {["Alza","Rohlik","IKEA","Orlen","DHL","Prologis","Amazon","CTP"].map((c) => <div key={c} className="cl">{c}</div>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta__inner">
          <div className="cta__img"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=700&q=80" alt="Moderní kancelář" /></div>
          <div className="cta__text">
            <h2 className="h2">Pojďte do toho<br /><em>s námi</em></h2>
            <p>Spojte se s naším týmem a nechte se provést trhem komerčních nemovitostí.</p>
            <a href="#kontakt" className="btn btn--fill btn--lg">Kontaktujte nás</a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="kontakt">
        <div className="wrap contact__grid">
          <div className="contact__info">
            <span className="label">Kontakt</span>
            <h2 className="h2">Ozvěte se <em>nám</em></h2>
            <div className="contact__row"><span className="contact__k">Telefon</span><a href="tel:+420224835000">+420 224 835 000</a></div>
            <div className="contact__row"><span className="contact__k">Email</span><a href="mailto:info@logicpro.cz">info@logicpro.cz</a></div>
            <div className="contact__row"><span className="contact__k">Adresa</span><span>Václavské náměstí 1, Praha 1</span></div>
            <div className="contact__countries">
              {["CZ","SK","HU","RO","PL"].map((c) => <span key={c}>{c}</span>)}
            </div>
          </div>
          <form className="contact__form glass" onSubmit={(e) => e.preventDefault()}>
            <h3>Zadat poptávku</h3>
            <input type="text" placeholder="Vaše jméno a příjmení *" required />
            <div className="form-2col">
              <input type="email" placeholder="Váš email *" required />
              <input type="tel" placeholder="Váš telefon *" required />
            </div>
            <textarea rows="4" placeholder="Vaše zpráva..." />
            <label className="check"><input type="checkbox" required /><span>Souhlasím se zpracováním osobních údajů *</span></label>
            <button type="submit" className="btn btn--fill btn--lg btn--full">Odeslat</button>
          </form>
        </div>
      </section>
    </>
  );
}
