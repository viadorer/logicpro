import { Link } from "react-router-dom";
import { CODEBOOKS, formatPrice, formatArea } from "../lib/codebooks";

export default function Card({ listing: l }) {
  const isRent = l.advert_function === 2;
  const subtypeLabel = CODEBOOKS.advert_subtype[l.advert_subtype] || "";
  const area = formatArea(l);

  return (
    <Link to={`/detail/${l.id}`} className="card">
      <div className="card__img">
        <img src={l.main_image} alt={l.title} loading="lazy" />
        <span className={`card__badge ${isRent ? "card__badge--rent" : "card__badge--sale"}`}>
          {isRent ? "Pronájem" : "Prodej"}
        </span>
      </div>
      <div className="card__body">
        <h3>{l.title}</h3>
        <p className="card__loc">{l.locality_city}, {l.locality_region}</p>
        <div className="card__tags">
          {area && <span>{area}</span>}
          {subtypeLabel && <span>{subtypeLabel}</span>}
        </div>
        <div className="card__foot">
          <span className="card__price">{formatPrice(l)}</span>
          <span>Detail &rarr;</span>
        </div>
      </div>
    </Link>
  );
}
