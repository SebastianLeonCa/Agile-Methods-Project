import { describe, expect, it } from "vitest";
import { fitWithin } from "@/lib/image";
import { pinHtml, project } from "@/lib/map";
import { isProtectedPath, pinVariant, safeNextPath } from "@/lib/utils";

describe("pinVariant", () => {
  it("uses the urgency color for spots that are not clean", () => {
    expect(pinVariant({ urgency: "low", status: "dirty" })).toBe("low");
    expect(pinVariant({ urgency: "medium", status: "dirty" })).toBe("medium");
    expect(pinVariant({ urgency: "high", status: "planned" })).toBe("high");
  });

  it("marks clean spots as clean, whatever the urgency", () => {
    expect(pinVariant({ urgency: "high", status: "clean" })).toBe("clean");
    expect(pinVariant({ urgency: "low", status: "clean" })).toBe("clean");
  });
});

describe("pinHtml", () => {
  it("renders a colored pin, with a check icon only for clean spots", () => {
    expect(pinHtml("high")).toBe('<div class="pin pin-high"></div>');
    expect(pinHtml("clean")).toContain('class="pin pin-clean"><svg');
  });
});

describe("project", () => {
  it("maps lat/lng to Web Mercator pixels", () => {
    expect(project(0, 0, 0)).toEqual({ x: 128, y: 128 });
    expect(project(0, 180, 1)).toEqual({ x: 512, y: 256 });
  });
});

describe("isProtectedPath", () => {
  it("protects account and create/edit pages", () => {
    for (const path of ["/profile", "/dashboard", "/spots/new", "/events/new", "/events/123/edit"]) {
      expect(isProtectedPath(path)).toBe(true);
    }
  });

  it("leaves public pages open, including the map", () => {
    for (const path of ["/", "/map", "/login", "/signup", "/events", "/profiles"]) {
      expect(isProtectedPath(path)).toBe(false);
    }
  });
});

describe("safeNextPath", () => {
  it("keeps local paths", () => {
    expect(safeNextPath("/profile")).toBe("/profile");
    expect(safeNextPath("/events?id=1")).toBe("/events?id=1");
  });

  it("falls back to the map for missing or external URLs", () => {
    expect(safeNextPath(null)).toBe("/map");
    expect(safeNextPath("https://evil.com")).toBe("/map");
    expect(safeNextPath("//evil.com")).toBe("/map");
    expect(safeNextPath("/\\evil.com", "/profile")).toBe("/profile");
  });
});

describe("fitWithin", () => {
  it("scales the longest side down to the max", () => {
    expect(fitWithin(4000, 3000, 1280)).toEqual({ width: 1280, height: 960 });
    expect(fitWithin(3000, 4000, 1280)).toEqual({ width: 960, height: 1280 });
  });

  it("never scales small images up", () => {
    expect(fitWithin(800, 600, 1280)).toEqual({ width: 800, height: 600 });
  });
});
