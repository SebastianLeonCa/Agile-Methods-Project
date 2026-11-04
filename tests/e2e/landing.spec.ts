import { expect, test } from "@playwright/test";

test("landing page shows the hero, how it works, features, live numbers and vision", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("CleanUp Map");
  await expect(page.getByRole("heading", { level: 1, name: "CleanUp Map" })).toBeVisible();
  await expect(page.getByText("See it. Map it. Clean it. Together.").first()).toBeVisible();

  await expect(page.getByRole("heading", { name: "Report a dirty spot" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Organize a cleanup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Show the before & after" })).toBeVisible();

  for (const feature of ["Litter Map", "Cleanup Events", "Before & After", "Community", "Safety"]) {
    await expect(page.getByRole("heading", { name: feature, exact: true })).toBeVisible();
  }

  // Live numbers from Supabase (the seed has spots, some of them clean).
  const reported = page.locator("dt", { hasText: "Spots reported" }).locator("..").locator("dd").filter({ visible: true });
  await expect(reported).toHaveText(/^[1-9]\d*$/);

  await expect(page.getByText(/A world where every community can see its dirty places/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Join your community" })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "OpenStreetMap" })).toBeVisible();
});

test("Explore the map opens the public map", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore the map" }).first().click();
  await expect(page).toHaveURL("/map");
  await expect(page.locator(".spot-pin").first()).toBeVisible();
});
