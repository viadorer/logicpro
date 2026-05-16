import { useState, useEffect, useCallback } from "react";

export default function Gallery({ images = [], badge }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const navigate = useCallback((dir) => {
    setActiveIdx((prev) => (prev + dir + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (!images.length) return null;
  const main = images[activeIdx];

  return (
    <div className="gallery">
      <div className="gallery__inner">
        <div className="gallery__main">
          <img src={main.url} alt={main.alt || ""} loading="eager" decoding="async" fetchPriority="high" />
          {badge && (
            <span className={`card__badge ${badge === "Pronájem" ? "card__badge--rent" : "card__badge--sale"}`}>
              {badge}
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="gallery__thumbs">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                type="button"
                className={`gallery__thumb${i === activeIdx ? " active" : ""}`}
                onClick={() => setActiveIdx(i)}
                aria-label={`Foto ${i + 1} z ${images.length}`}
              >
                <img src={img.url} alt={img.alt || ""} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
