import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import { formatPrice, formatArea, CODEBOOKS } from "../lib/codebooks";
import "maplibre-gl/dist/maplibre-gl.css";

const mapStyle = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: "osm-raster", type: "raster", source: "osm-tiles", minzoom: 0, maxzoom: 19 }],
};

export default function MapListings({ listings = [] }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const geoListings = useMemo(
    () => listings.filter((l) => l.locality_latitude && l.locality_longitude),
    [listings]
  );

  const bounds = useMemo(() => {
    if (!geoListings.length) return null;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const l of geoListings) {
      if (l.locality_latitude < minLat) minLat = l.locality_latitude;
      if (l.locality_latitude > maxLat) maxLat = l.locality_latitude;
      if (l.locality_longitude < minLng) minLng = l.locality_longitude;
      if (l.locality_longitude > maxLng) maxLng = l.locality_longitude;
    }
    return { minLat, maxLat, minLng, maxLng };
  }, [geoListings]);

  const initialView = useMemo(() => {
    if (!bounds) return { latitude: 49.8, longitude: 15.5, zoom: 7 };
    return {
      latitude: (bounds.minLat + bounds.maxLat) / 2,
      longitude: (bounds.minLng + bounds.maxLng) / 2,
      zoom: 7,
    };
  }, [bounds]);

  const handleMarkerClick = useCallback((l) => {
    setSelected(l);
  }, []);

  return (
    <div className="map-listings-container">
      <Map
        initialViewState={initialView}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        attributionControl={true}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        {geoListings.map((l) => (
          <Marker
            key={l.id}
            latitude={l.locality_latitude}
            longitude={l.locality_longitude}
            onClick={(e) => { e.originalEvent.stopPropagation(); handleMarkerClick(l); }}
          >
            <div className={`map-marker-listing ${l.advert_function === 2 ? "map-marker-listing--rent" : "map-marker-listing--sale"}`}>
              {formatPrice(l).split(" ")[0]}
            </div>
          </Marker>
        ))}
        {selected && (
          <Popup
            latitude={selected.locality_latitude}
            longitude={selected.locality_longitude}
            offset={[0, -16]}
            closeOnClick={false}
            onClose={() => setSelected(null)}
            maxWidth="280px"
          >
            <div className="map-popup" onClick={() => navigate(`/detail/${selected.id}`)} style={{ cursor: "pointer" }}>
              {selected.main_image && <img src={selected.main_image} alt={selected.title} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
              <strong style={{ fontSize: 14 }}>{selected.title}</strong>
              <p style={{ fontSize: 12, color: "#666", margin: "2px 0 6px" }}>
                {selected.locality_city}, {CODEBOOKS.advert_subtype[selected.advert_subtype]}
              </p>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{formatPrice(selected)}</span>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
