import { expect, test } from "@playwright/test";

test("home page shows the header and slogan", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("CleanUp Map");
  await expect(page.getByRole("heading", { level: 1, name: "CleanUp Map" })).toBeVisible();
  await expect(page.getByText("See it. Map it. Clean it. Together.")).toBeVisible();
});

test("map shows spot pins and opens details for a clicked pin", async ({ page }) => {
  await page.goto("/");

  // Map with OpenStreetMap attribution.
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.getByText("OpenStreetMap", { exact: false }).first()).toBeVisible();

  // Pins loaded from the spots table.
  const pin = page.locator(".spot-pin").first();
  await expect(pin).toBeVisible();
  const title = await pin.getAttribute("title");
  expect(title).toBeTruthy();

  // Click a pin → details panel shows that spot.
  await pin.click();
  const details = page.getByRole("complementary", { name: "Spot details" });
  await expect(details).toBeVisible();
  await expect(details.getByRole("heading", { name: title! })).toBeVisible();

  // Close it.
  await details.getByRole("button", { name: "Close details" }).click();
  await expect(details).toBeHidden();
});
