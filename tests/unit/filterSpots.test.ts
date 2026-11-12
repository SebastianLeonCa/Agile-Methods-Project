import { describe, expect, it } from "vitest";
import { filterSpots, NO_FILTERS } from "@/lib/utils";
import { makeSpot } from "./fixtures";

const park = makeSpot({ id: "park-high", type: "park", urgency: "high", status: "dirty" });
const beach = makeSpot({ id: "beach-low", type: "beach", urgency: "low", status: "planned" });
const street = makeSpot({ id: "street-high", type: "street", urgency: "high", status: "clean" });
const spots = [park, beach, street];
const ids = (list: { id: string }[]) => list.map((s) => s.id);

describe("filterSpots", () => {
  it("shows every spot when no filter is chosen", () => {
    expect(ids(filterSpots(spots, NO_FILTERS))).toEqual(["park-high", "beach-low", "street-high"]);
  });

  it("shows spots matching any chosen value within a group", () => {
    expect(ids(filterSpots(spots, { ...NO_FILTERS, types: ["park", "beach"] }))).toEqual(["park-high", "beach-low"]);
    expect(ids(filterSpots(spots, { ...NO_FILTERS, statuses: ["clean"] }))).toEqual(["street-high"]);
  });

  it("combines groups: a spot must match every group that has a choice", () => {
    expect(ids(filterSpots(spots, { types: ["park", "street"], urgencies: ["high"], statuses: ["dirty"] }))).toEqual([
      "park-high",
    ]);
    expect(filterSpots(spots, { ...NO_FILTERS, types: ["beach"], urgencies: ["high"] })).toEqual([]);
  });
});
