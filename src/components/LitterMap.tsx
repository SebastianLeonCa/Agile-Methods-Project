"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { Spot } from "@/lib/types";
import { spotIcon } from "@/lib/utils";

// Carnegie Mellon University, Pittsburgh — used when there are no spots to fit.
const DEFAULT_CENTER: [number, number] = [40.4433, -79.9436];

// divIcon with an emoji avoids Leaflet's broken default marker images.
function pinIcon(spot: Spot, selected: boolean) {
  return L.divIcon({
    className: selected ? "spot-pin spot-pin-selected" : "spot-pin",
    html: `<span>${spotIcon(spot)}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

type Props = {
  spots: Spot[];
  selectedId: string | null;
  onSelect: (spot: Spot) => void;
};

export default function LitterMap({ spots, selectedId, onSelect }: Props) {
  const bounds = spots.length > 0 ? L.latLngBounds(spots.map((s) => [s.lat, s.lng])) : undefined;

  return (
    <MapContainer
      {...(bounds ? { bounds, boundsOptions: { padding: [40, 40] } } : { center: DEFAULT_CENTER, zoom: 14 })}
      maxZoom={19}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={pinIcon(spot, spot.id === selectedId)}
          title={spot.title}
          eventHandlers={{ click: () => onSelect(spot) }}
        />
      ))}
    </MapContainer>
  );
}
