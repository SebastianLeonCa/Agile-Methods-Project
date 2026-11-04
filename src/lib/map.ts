// Shared map settings.
// OpenStreetMap tiles (free, no key), softened with the `.map-tiles` CSS filter in globals.css for a calm look.
// CARTO Positron was the first choice, but it now returns "API KEY REQUIRED" tiles without a CARTO account.

export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const MAX_ZOOM = 19;

export function tileUrl(z: number, x: number, y: number): string {
  return TILE_URL.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y));
}

/** Carnegie Mellon University, Pittsburgh: default map center. */
export const DEFAULT_CENTER: [number, number] = [40.4433, -79.9436];

/** Web Mercator: world pixel coordinates of a point at a zoom level (256px tiles). */
export function project(lat: number, lng: number, zoom: number) {
  const scale = 256 * 2 ** zoom;
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

// Inline lucide "check" icon for clean pins (divIcon HTML can't use React components).
const CHECK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

export function pinHtml(variant: string): string {
  return `<div class="pin pin-${variant}">${variant === "clean" ? CHECK_SVG : ""}</div>`;
}
