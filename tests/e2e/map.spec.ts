import { expect, test } from "@playwright/test";

test("map shows pins, legend and attribution, and opens details for a clicked pin", async ({ page }) => {
  await page.goto("/map");

  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".leaflet-control-attribution")).toContainText("OpenStreetMap contributors");
  await expect(page.getByRole("group", { name: "Map legend" })).toBeVisible();

  const pin = page.locator(".spot-pin").first();
  await expect(pin).toBeVisible();
  const title = await pin.getAttribute("title");
  expect(title).toBeTruthy();

  await pin.click();
  const details = page.getByRole("complementary", { name: "Spot details" });
  await expect(details).toBeVisible();
  await expect(details.getByRole("heading", { name: title! })).toBeVisible();

  await details.getByRole("button", { name: "Close details" }).click();
  await expect(details).toBeHidden();
});

test("visitors get a login prompt when they try to report a spot", async ({ page }) => {
  await page.goto("/map");
  await page.getByRole("button", { name: "Report a spot" }).click();

  const dialog = page.getByRole("dialog", { name: "Log in to report a spot" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login?next=%2Fmap");
  await expect(dialog.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup?next=%2Fmap");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

// Regression: Next keeps visited pages alive and shows them again, which used to crash the map
// with "This page couldn't load" (Leaflet: "Map container is being reused by another instance").
test("going back and forth between pages keeps the map working", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/map");
  await expect(page.locator(".spot-pin").first()).toBeVisible();

  for (let i = 0; i < 2; i++) {
    await page.getByRole("link", { name: "CleanUp Map home" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "CleanUp Map" })).toBeVisible();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Map" }).click();
    await expect(page).toHaveURL("/map");
    await expect(page.locator(".spot-pin").first()).toBeVisible();
  }

  await page.locator(".spot-pin").first().click();
  await expect(page.getByRole("complementary", { name: "Spot details" })).toBeVisible();
  await expect(page.getByText("couldn’t load")).toHaveCount(0);
  expect(errors).toEqual([]);
});
