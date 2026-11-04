import { expect, test } from "@playwright/test";

test("home page shows the header and slogan", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("CleanUp Map");
  await expect(page.getByRole("heading", { level: 1, name: "CleanUp Map" })).toBeVisible();
  await expect(page.getByText("See it. Map it. Clean it. Together.")).toBeVisible();
});
