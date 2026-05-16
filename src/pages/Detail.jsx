import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDetail, fetchSimilar } from "../lib/api";
import { CODEBOOKS, formatPrice, formatArea } from "../lib/codebooks";
import { useSEO } from "../lib/useSEO";
import Gallery from "../components/Gallery";
import ParamsGrid from "../components/ParamsGrid";
import MapView from "../components/MapView";
import Card from "../components/Card";
import InquiryForm from "../components/InquiryForm";

export default function Detail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "instant" });
    Promise.all([fetchDetail(id), fetchSimilar(id)])
      .then(([detail, sim]) => {
        setListing(detail);
        setSimilar(sim.listings);
        // Scroll znovu po vykreslení obsahu
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // SEO musi byt zavolano ve stejnem poradi pri kazdem renderu (React rules).
  // Pri prvnim renderu nebo prazdnem stavu posleme prazdne args.
  const l = listing;
  const isRent = l?.advert_function === 2;
  const badge = isRent ? "Pronájem" : "Prodej";
  const features = Array.isArray(l?.features)
    ? l.features
    : (Array.isArray(l?.features_jsonb) ? l.features_jsonb : []);
  const address = l ? [l.locality_citypart, l.locality_region].filter(Boolean).join(", ") : "";
  const heroImage = l?.images?.find((i) => i.is_main === 1)?.url || l?.images?.[0]?.url;
  const areaStr = l ? formatArea(l) : null;

  useSEO(l ? {
    title: `${l.title} — ${l.locality_city}`,
    description: `${badge}: ${l.title} v lokalitě ${l.locality_city}${areaStr ? ", " + areaStr : ""}. ${formatPrice(l)}.`,
    canonical: `/detail/${l.id}`,
    image: heroImage,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: l.title,
      description: l.description?.slice(0, 500),
      url: `https://logicpro.cz/detail/${l.id}`,
      image: heroImage,
      address: {
        "@type": "PostalAddress",
        addressLocality: l.locality_city,
        addressRegion: l.locality_region,
        streetAddress: l.locality_street,
        addressCountry: "CZ",
      },
      ...(l.locality_latitude && l.locality_longitude ? {
        geo: {
          "@type": "GeoCoordinates",
          latitude: l.locality_latitude,
          longitude: l.locality_longitude,
        },
      } : {}),
      ...(l.advert_price ? {
        offers: {
          "@type": "Offer",
          price: l.advert_price,
          priceCurrency: CODEBOOKS.advert_price_currency[l.advert_price_currency] || "CZK",
          availability: l.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      } : {}),
    },
  } : {});

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
            <InquiryForm listing={l} />
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
