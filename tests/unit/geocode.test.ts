import { describe, expect, it } from "vitest";
import { formatAddress } from "@/lib/geocode";

// Shapes taken from Nominatim /reverse?format=jsonv2 responses.
const cmu = {
  name: "",
  display_name: "5000, Forbes Avenue, Squirrel Hill North, Pittsburgh, Allegheny County, Pennsylvania, 15213, United States",
  address: {
    house_number: "5000",
    road: "Forbes Avenue",
    suburb: "Squirrel Hill North",
    city: "Pittsburgh",
    county: "Allegheny County",
    state: "Pennsylvania",
    "ISO3166-2-lvl4": "US-PA",
    postcode: "15213",
    country: "United States",
    country_code: "us",
  },
};

describe("formatAddress", () => {
  it("turns a street address into a short one-line address", () => {
    expect(formatAddress(cmu)).toBe("5000 Forbes Avenue, Pittsburgh, PA 15213");
  });

  it("starts with the place name for parks and landmarks, and uses towns when there is no city", () => {
    const park = {
      name: "Frick Park",
      address: { leisure: "Frick Park", road: "Beechwood Boulevard", town: "Wilkinsburg", "ISO3166-2-lvl4": "US-PA" },
    };
    expect(formatAddress(park)).toBe("Frick Park, Beechwood Boulevard, Wilkinsburg, PA");
  });

  it("keeps the full region name outside the US", () => {
    const berlin = { address: { road: "Unter den Linden", city: "Berlin", state: "Berlin", "ISO3166-2-lvl4": "DE-BE", country_code: "de" } };
    expect(formatAddress(berlin)).toBe("Unter den Linden, Berlin, Berlin");
  });

  it("returns an empty address when Nominatim has nothing (e.g. middle of a lake)", () => {
    expect(formatAddress({ error: "Unable to geocode" })).toBe("");
  });
});
