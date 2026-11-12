// Reverse geocoding with OpenStreetMap Nominatim (free, no key; max 1 request/second, so callers debounce).

export type NominatimResult = {
  name?: string;
  display_name?: string;
  address?: Record<string, string>;
  error?: string;
};

/** Short one-line address, e.g. "5000 Forbes Avenue, Pittsburgh, PA 15213". */
export function formatAddress(result: NominatimResult): string {
  const a = result.address ?? {};
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const locality = a.city ?? a.town ?? a.village ?? a.hamlet ?? a.suburb;
  // "US-PA" → "PA"; other countries keep the full region name.
  const iso = a["ISO3166-2-lvl4"];
  const region = iso?.startsWith("US-") ? iso.slice(3) : a.state;
  const regionLine = [region, a.postcode].filter(Boolean).join(" ");
  return [result.name, street, locality, regionLine].filter(Boolean).join(", ");
}

/** Address for a point, or "" if none was found. Throws on network errors. */
export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return formatAddress(await res.json());
}
