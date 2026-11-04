"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents, ZoomControl } from "react-leaflet";
import { useShownOnly } from "@/components/useShownOnly";
import { DEFAULT_CENTER, MAX_ZOOM, pinHtml, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";

export type LatLng = { lat: number; lng: number };

const pin = L.divIcon({ className: "spot-pin", html: pinHtml("home"), iconSize: [30, 30], iconAnchor: [15, 15] });

function ClickToPick({ onChange }: { onChange: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Small map: click to place a pin, drag it to adjust. Load with next/dynamic (ssr: false). */
export default function LocationPicker({ value, onChange }: { value: LatLng | null; onChange: (p: LatLng) => void }) {
  const shown = useShownOnly();
  const box = "h-60 w-full overflow-hidden rounded-xl border border-line";
  if (!shown) return <div className={`${box} bg-surface`} />;

  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
      zoom={value ? 15 : 13}
      maxZoom={MAX_ZOOM}
      zoomControl={false}
      className={box}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={MAX_ZOOM} className="map-tiles" />
      <ZoomControl position="bottomright" />
      <ClickToPick onChange={onChange} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pin}
          draggable
          title="Your home location"
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              onChange({ lat, lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
