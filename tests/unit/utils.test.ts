import { describe, expect, it } from "vitest";
import { fitWithin } from "@/lib/image";
import { isProtectedPath, safeNextPath, spotIcon } from "@/lib/utils";

describe("spotIcon", () => {
  it("shows the urgency color for spots that are not clean", () => {
    expect(spotIcon({ urgency: "low", status: "dirty" })).toBe("🟢");
    expect(spotIcon({ urgency: "medium", status: "dirty" })).toBe("🟡");
    expect(spotIcon({ urgency: "high", status: "planned" })).toBe("🔴");
  });

  it("shows a check mark for clean spots, whatever the urgency", () => {
    expect(spotIcon({ urgency: "high", status: "clean" })).toBe("✅");
    expect(spotIcon({ urgency: "low", status: "clean" })).toBe("✅");
  });
});

describe("isProtectedPath", () => {
  it("protects account and create/edit pages", () => {
    for (const path of ["/profile", "/dashboard", "/spots/new", "/events/new", "/events/123/edit"]) {
      expect(isProtectedPath(path)).toBe(true);
    }
  });

  it("leaves public pages open", () => {
    for (const path of ["/", "/login", "/signup", "/events", "/profiles"]) {
      expect(isProtectedPath(path)).toBe(false);
    }
  });
});

describe("safeNextPath", () => {
  it("keeps local paths", () => {
    expect(safeNextPath("/profile")).toBe("/profile");
    expect(safeNextPath("/events?id=1")).toBe("/events?id=1");
  });

  it("falls back for missing or external URLs", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("https://evil.com", "/profile")).toBe("/profile");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
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
