import { describe, expect, it } from "vitest";
import { spotIcon } from "@/lib/utils";

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
