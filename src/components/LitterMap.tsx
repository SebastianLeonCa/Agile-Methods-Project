"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import type { LatLng } from "@/components/LocationPicker";
import type { Spot } from "@/lib/types";
import { DEFAULT_CENTER, MAX_ZOOM, pinHtml, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";
import { pinVariant } from "@/lib/utils";

type MapView = { center: [number, number]; zoom: number };

// Last view, so the map reopens where the user left it (the map is rebuilt when its page is shown again).
let savedView: MapView | null = null;

function saveView(map: L.Map) {
  const c = map.getCenter();
  savedView = { center: [c.lat, c.lng], zoom: map.getZoom() };
}

// Space covered by the floating UI, so the selected pin is panned into the visible part of the map.
const TOP_BAR = 72;
const DESKTOP_PANEL = 380 + 32;
const MOBILE_SHEET = 0.6; // fraction of the map height

function pinIcon(spot: Spot, selected: boolean) {
  return L.divIcon({
    className: selected ? "spot-pin spot-pin-selected" : "spot-pin",
    html: pinHtml(pinVariant(spot)),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const draftIcon = L.divIcon({ className: "spot-pin", html: pinHtml("new"), iconSize: [30, 30], iconAnchor: [15, 15] });

/** Pans the focused point (selected pin or new report pin) into the part of the map not covered by panels. */
function PanToFocus({ focus }: { focus: (LatLng & { key: string }) | null }) {
  const map = useMap();
  const latest = useRef(focus);
  useEffect(() => {
    latest.current = focus;
  });
  // Only when the focus changes (new pin selected, report pin first placed), not while the report pin is dragged.
  const key = focus?.key;
  useEffect(() => {
    const spot = latest.current;
    if (!key || !spot) return;
    const size = map.getSize();
    const desktop = window.matchMedia("(min-width: 640px)").matches;
    const visibleW = size.x - (desktop ? DESKTOP_PANEL : 0);
    const visibleBottom = size.y * (desktop ? 1 : 1 - MOBILE_SHEET);
    const target = L.point(visibleW / 2, (TOP_BAR + visibleBottom) / 2);
    const pin = map.latLngToContainerPoint([spot.lat, spot.lng]);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.panBy(pin.subtract(target), { animate: !reduceMotion, duration: 0.25 });
  }, [map, key]);
  return null;
}

/** Saves the view on every move; reports clicks on empty map. */
function ViewTracker({ onMapClick }: { onMapClick: (p: LatLng) => void }) {
  const map = useMapEvents({
    moveend: () => saveView(map),
    click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

type Props = {
  spots: Spot[];
  selected: Spot | null;
  onSelect: (spot: Spot | null) => void;
  /** Report mode: clicking the map places (and dragging moves) the new spot's pin. */
  report?: { pin: LatLng | null; onPin: (p: LatLng) => void };
};

export default function LitterMap({ spots, selected, onSelect, report }: Props) {
  const start = savedView
    ? { center: savedView.center, zoom: savedView.zoom }
    : spots.length > 0
      ? { bounds: L.latLngBounds(spots.map((s) => [s.lat, s.lng])), boundsOptions: { padding: [60, 60] as [number, number] } }
      : { center: DEFAULT_CENTER, zoom: 14 };

  return (
    <MapContainer {...start} maxZoom={MAX_ZOOM} zoomControl={false} className="h-full w-full">
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={MAX_ZOOM} className="map-tiles" />
      <ZoomControl position="bottomright" />
      <ViewTracker onMapClick={(p) => (report ? report.onPin(p) : onSelect(null))} />
      <PanToFocus
        focus={report?.pin ? { ...report.pin, key: "report" } : selected ? { lat: selected.lat, lng: selected.lng, key: selected.id } : null}
      />
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={pinIcon(spot, spot.id === selected?.id)}
          title={spot.title}
          eventHandlers={{ click: () => onSelect(spot) }}
        />
      ))}
      {report?.pin && (
        <Marker
          position={[report.pin.lat, report.pin.lng]}
          icon={draftIcon}
          draggable
          zIndexOffset={2000}
          title="New spot (drag to move)"
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              report.onPin({ lat, lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
