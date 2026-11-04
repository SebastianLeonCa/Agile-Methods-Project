import { describe, expect, it } from "vitest";
import { validateProfile, validateSignup } from "@/lib/validation";

const goodSignup = { username: "panther_99", email: "ana@cmu.edu", password: "longenough", confirmPassword: "longenough" };

describe("validateSignup", () => {
  it("accepts a valid sign-up", () => {
    expect(validateSignup(goodSignup)).toEqual({});
  });

  it("rejects bad usernames", () => {
    for (const username of ["ab", "Has Space", "UPPER", "a".repeat(31), "dash-name"]) {
      expect(validateSignup({ ...goodSignup, username })).toHaveProperty("username");
    }
  });

  it("rejects an invalid email", () => {
    expect(validateSignup({ ...goodSignup, email: "not-an-email" })).toHaveProperty("email");
  });

  it("rejects short passwords and mismatched confirmation", () => {
    const errors = validateSignup({ ...goodSignup, password: "short", confirmPassword: "other" });
    expect(errors.password).toMatch(/at least 8/);
    expect(errors.confirmPassword).toBe("Passwords do not match.");
  });
});

describe("validateProfile", () => {
  const goodProfile = { username: "panther_99", homeArea: "Oakland", homeLat: 40.44, homeLng: -79.94 };

  it("accepts a valid profile, with or without a home location", () => {
    expect(validateProfile(goodProfile)).toEqual({});
    expect(validateProfile({ ...goodProfile, homeLat: null, homeLng: null })).toEqual({});
  });

  it("rejects a half-set or out-of-range home location", () => {
    expect(validateProfile({ ...goodProfile, homeLng: null })).toHaveProperty("home");
    expect(validateProfile({ ...goodProfile, homeLat: 95 })).toHaveProperty("home");
  });

  it("rejects a home area over 100 characters", () => {
    expect(validateProfile({ ...goodProfile, homeArea: "x".repeat(101) })).toHaveProperty("homeArea");
  });
});
