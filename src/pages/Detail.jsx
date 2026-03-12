import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDetail, fetchSimilar } from "../lib/api";
import { CODEBOOKS } from "../lib/codebooks";
import Gallery from "../components/Gallery";
import ParamsGrid from "../components/ParamsGrid";
import MapView from "../components/MapView";
import Card from "../components/Card";

export default function Detail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    Promise.all([fetchDetail(id), fetchSimilar(id)])
      .then(([detail, sim]) => {
        setListing(detail);
        setSimilar(sim.listings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "200px 0", textAlign: "center" }}>
        <div className="loader"><div className="loader__spinner" /></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ padding: "200px 0", textAlign: "center" }}>
        <h2>Nemovitost nenalezena</h2>
        <Link to="/nabidky" className="btn btn--fill btn--sm" style={{ marginTop: 20 }}>Zpět na nabídky</Link>
      </div>
    );
  }

  const l = listing;
  const isRent = l.advert_function === 2;
  const badge = isRent ? "Pronájem" : "Prodej";
  const features = Array.isArray(l.features) ? l.features : [];
  const address = [l.locality_citypart, l.locality_region].filter(Boolean).join(", ");

  return (
    <>
      <section className="detail-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link to="/">Domů</Link><span>/</span>
            <Link to="/nabidky">Nabídka</Link><span>/</span>
            <span>{l.title}</span>
          </div>
        </div>
      </section>

      <section className="gallery">
        <div className="wrap">
          <Gallery images={l.images || []} badge={badge} />
        </div>
      </section>

      <section className="detail">
        <div className="wrap detail__grid">
          <div className="detail__main">
            <h1 className="detail__title">{l.title}</h1>
            <p className="detail__loc">{l.locality_city}, {l.locality_region}</p>
            <div className="detail__badges">
              <span className={`chip ${isRent ? "chip--rent" : "chip--sale"}`}>{badge}</span>
              {CODEBOOKS.advert_subtype[l.advert_subtype] && (
                <span className="chip">{CODEBOOKS.advert_subtype[l.advert_subtype]}</span>
              )}
            </div>

            <ParamsGrid listing={l} />

            {l.description && (
              <div className="detail__section">
                <h2>Popis nemovitosti</h2>
                {l.description.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            {features.length > 0 && (
              <div className="detail__section">
                <h2>Vybavení a parametry</h2>
                <div className="features">
                  {features.map((f, i) => <div key={i} className="features__item">{f}</div>)}
                </div>
              </div>
            )}

            <div className="detail__section">
              <h2>Poloha</h2>
              <MapView
                latitude={l.locality_latitude}
                longitude={l.locality_longitude}
                title={l.title}
                address={address}
              />
            </div>
          </div>

          <aside className="inquiry glass">
            <h3>Máte zájem?</h3>
            <p>Kontaktujte nás pro více informací nebo si domluvte osobní prohlídku nemovitosti.</p>
            <div className="inquiry__agent">
              <div className="inquiry__avatar" />
              <div>
                <strong>Jan Novák</strong>
                <span>Senior konzultant</span>
              </div>
            </div>
            <a href="tel:+420224835000" className="btn btn--outline btn--full btn--sm">+420 224 835 000</a>
            <a href="mailto:info@logicpro.cz" className="btn btn--fill btn--full btn--sm">Napsat zprávu</a>
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="similar">
          <div className="wrap">
            <span className="label">Podobné nabídky</span>
            <h2 className="h2">Mohlo by vás <em>zajímat</em></h2>
            <div className="listings__grid">
              {similar.map((s) => <Card key={s.id} listing={s} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
