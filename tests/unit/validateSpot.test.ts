import { describe, expect, it } from "vitest";
import { validateSpot } from "@/lib/validation";

const folder = "https://x.supabase.co/storage/v1/object/public/spot-photos/user-1/";
const goodSpot = {
  title: "Trash under the bridge",
  description: "Bags and bottles by the river trail.",
  type: "river",
  urgency: "high",
  lat: 40.4433,
  lng: -79.9436,
  address: "Junction Hollow Trail, Pittsburgh, PA",
  photoUrl: `${folder}abc.jpg`,
};

describe("validateSpot", () => {
  it("accepts a valid report, with or without photo, description and address", () => {
    expect(validateSpot(goodSpot, folder)).toEqual({});
    expect(validateSpot({ ...goodSpot, photoUrl: "", description: "", address: "" }, folder)).toEqual({});
  });

  it("needs a title of 3–100 characters", () => {
    for (const title of ["", "ab", "x".repeat(101)]) {
      expect(validateSpot({ ...goodSpot, title }, folder)).toHaveProperty("title");
    }
  });

  it("needs a pin on the map inside the valid range", () => {
    expect(validateSpot({ ...goodSpot, lat: null, lng: null }, folder).location).toBe("Tap the map to place the pin.");
    expect(validateSpot({ ...goodSpot, lat: 91 }, folder)).toHaveProperty("location");
    expect(validateSpot({ ...goodSpot, lng: -181 }, folder)).toHaveProperty("location");
  });

  it("only accepts known types and urgency levels", () => {
    expect(validateSpot({ ...goodSpot, type: "volcano" }, folder)).toHaveProperty("type");
    expect(validateSpot({ ...goodSpot, urgency: "extreme" }, folder)).toHaveProperty("urgency");
  });

  it("limits description to 1000 and address to 200 characters", () => {
    expect(validateSpot({ ...goodSpot, description: "x".repeat(1001) }, folder)).toHaveProperty("description");
    expect(validateSpot({ ...goodSpot, address: "x".repeat(201) }, folder)).toHaveProperty("address");
  });

  it("only accepts a photo from the reporter's own folder", () => {
    const otherUser = "https://x.supabase.co/storage/v1/object/public/spot-photos/user-2/abc.jpg";
    expect(validateSpot({ ...goodSpot, photoUrl: otherUser }, folder)).toHaveProperty("photo");
    expect(validateSpot({ ...goodSpot, photoUrl: "https://evil.example/x.jpg" }, folder)).toHaveProperty("photo");
  });
});
