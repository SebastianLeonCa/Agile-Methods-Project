import { MapPin } from "lucide-react";
import { pinHtml, project, tileUrl } from "@/lib/map";

// Static map illustration for the landing page: real OpenStreetMap tiles around CMU with sample pins.
// No Leaflet here, so it renders on the server and loads instantly.
const ZOOM = 15;
const CENTER = { lat: 40.4372, lng: -79.9445 }; // a bit south of the pins' center, so the card below doesn't cover them
const SCALE = 0.8; // shows a slightly wider area than zoom 15
const FRAME = { w: 680 / SCALE, h: 520 / SCALE };

const SAMPLE_PINS = [
  { lat: 40.4357, lng: -79.9462, variant: "high" },
  { lat: 40.4395, lng: -79.945, variant: "medium" },
  { lat: 40.44, lng: -79.9503, variant: "high" },
  { lat: 40.4444, lng: -79.9489, variant: "medium" },
  { lat: 40.443, lng: -79.953, variant: "clean" },
  { lat: 40.4458, lng: -79.942, variant: "low" },
  { lat: 40.4415, lng: -79.9445, variant: "clean" },
  { lat: 40.433, lng: -79.9495, variant: "high" },
  { lat: 40.432, lng: -79.938, variant: "low" },
];

export default function MapPreview() {
  const c = project(CENTER.lat, CENTER.lng, ZOOM);
  const tiles = [];
  for (let tx = Math.floor((c.x - FRAME.w / 2) / 256); tx <= Math.floor((c.x + FRAME.w / 2) / 256); tx++) {
    for (let ty = Math.floor((c.y - FRAME.h / 2) / 256); ty <= Math.floor((c.y + FRAME.h / 2) / 256); ty++) {
      tiles.push({ tx, ty, left: tx * 256 - c.x, top: ty * 256 - c.y });
    }
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-[#f2f3f0] shadow-xl shadow-slate-900/10">
      <div className="absolute top-1/2 left-1/2 origin-top-left" style={{ transform: `scale(${SCALE})` }} aria-hidden>
        {tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${t.tx}-${t.ty}`}
            src={tileUrl(ZOOM, t.tx, t.ty)}
            alt=""
            width={256}
            height={256}
            className="map-tiles absolute max-w-none"
            style={{ left: t.left, top: t.top }}
          />
        ))}
        {SAMPLE_PINS.map((p, i) => {
          const pt = project(p.lat, p.lng, ZOOM);
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pt.x - c.x, top: pt.y - c.y }}
              dangerouslySetInnerHTML={{ __html: pinHtml(p.variant) }}
            />
          );
        })}
      </div>

      {/* Floating sample card */}
      <div className="absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur sm:right-auto sm:max-w-xs">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-high">
          <MapPin className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Plastic around Panther Hollow Lake</p>
          <p className="text-xs text-muted">High urgency · Schenley Park</p>
        </div>
      </div>
      <p className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium shadow-sm">
        <span className="size-2 animate-pulse rounded-full bg-brand" aria-hidden />
        Live map · Pittsburgh
      </p>
      <p className="absolute top-3 right-3 hidden rounded bg-white/80 px-1.5 text-[10px] text-muted sm:block">© OpenStreetMap contributors</p>
    </div>
  );
}
