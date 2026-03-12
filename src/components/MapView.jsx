import { useState, useMemo } from "react";
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const TILE_SETS = {
  basic: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  topo: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
  aerial: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

function makeStyle(tileSet = "basic") {
  return {
    version: 8,
    sources: {
      "map-tiles": {
        type: "raster",
        tiles: [TILE_SETS[tileSet]],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [{ id: "map-raster", type: "raster", source: "map-tiles", minzoom: 0, maxzoom: 19 }],
  };
}

export default function MapView({ latitude, longitude, title, address }) {
  const [popup, setPopup] = useState(true);
  const [tileSet, setTileSet] = useState("basic");
  const mapStyle = useMemo(() => makeStyle(tileSet), [tileSet]);

  if (!latitude || !longitude) {
    return <div className="map-placeholder">Mapa není k dispozici</div>;
  }

  return (
    <div className="map-container">
      <div className="map-layers">
        {Object.keys(TILE_SETS).map((key) => (
          <button
            key={key}
            className={`map-layers__btn${tileSet === key ? " active" : ""}`}
            onClick={() => setTileSet(key)}
          >
            {key === "basic" ? "Mapa" : key === "topo" ? "Topo" : "Satelit"}
          </button>
        ))}
      </div>
      <Map
        initialViewState={{ latitude, longitude, zoom: 14 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        attributionControl={true}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <Marker latitude={latitude} longitude={longitude} onClick={() => setPopup(true)}>
          <div className="map-marker" />
        </Marker>
        {popup && (
          <Popup latitude={latitude} longitude={longitude} offset={[0, -12]} closeOnClick={false} onClose={() => setPopup(false)}>
            <strong>{title}</strong>
            {address && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>{address}</p>}
          </Popup>
        )}
      </Map>
    </div>
  );
}
