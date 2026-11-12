import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

// A 1×1 PNG, enough for the browser to compress and upload as the "before" photo.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

let title = "";

// Remove the spot (and its photo) this test reported, logged in as the test user (RLS: reporters delete their own).
test.afterEach(async () => {
  if (!title || !email || !password) return;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  await supabase.auth.signInWithPassword({ email, password });
  const { data } = await supabase.from("spots").delete().eq("title", title).select("before_photo_url");
  const photos = (data ?? []).flatMap((s) => (s.before_photo_url ? [s.before_photo_url.split("/spot-photos/")[1]] : []));
  if (photos.length) await supabase.storage.from("spot-photos").remove(photos);
  title = "";
});

test("test user can report a spot with a photo, then confirm it is still dirty", async ({ page }) => {
  test.skip(!email || !password, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Nominatim is a shared free service: answer address lookups with a fixed result.
  await page.route("https://nominatim.openstreetmap.org/**", (route) =>
    route.fulfill({
      json: {
        address: { house_number: "5000", road: "Forbes Avenue", city: "Pittsburgh", "ISO3166-2-lvl4": "US-PA", postcode: "15213" },
      },
    }),
  );

  await page.goto("/login?next=/map");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("main").getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/map");
  await expect(page.locator(".spot-pin").first()).toBeVisible();

  // Report a spot → tap the map (left edge: the map keeps 60px around pins free) → the form opens.
  await page.getByRole("button", { name: "Report a spot" }).click();
  await expect(page.getByText("Tap the map where the litter is.")).toBeVisible();
  await page.locator(".leaflet-container").click({ position: { x: 25, y: 200 } });
  const form = page.getByRole("complementary", { name: "Report a spot" });
  await expect(form).toBeVisible();
  await expect(page.getByTitle("New spot (drag to move)")).toBeVisible();
  await expect(form.getByLabel("Address")).toHaveValue("5000 Forbes Avenue, Pittsburgh, PA 15213");

  // Validation: a title is required.
  await form.getByRole("button", { name: "Report spot" }).click();
  await expect(form.getByText("Title must be 3–100 characters.")).toBeVisible();

  title = `E2E bottles ${Date.now()}`;
  await form.getByLabel("Title").fill(title);
  await form.getByText("River", { exact: true }).click();
  await form.getByText("High", { exact: true }).click();
  await form.getByLabel("Description (optional)").fill("Reported by the automated test.");
  await form.getByLabel("Before photo").setInputFiles({ name: "before.png", mimeType: "image/png", buffer: PNG });
  await expect(form.getByRole("img", { name: "Before photo preview" })).toBeVisible();
  await form.getByRole("button", { name: "Report spot" }).click();

  // The new spot is on the map and its details are open.
  await expect(page.getByText("Thanks! Your spot is on the map.")).toBeVisible();
  const details = page.getByRole("complementary", { name: "Spot details" });
  await expect(details.getByRole("heading", { name: title })).toBeVisible();
  await expect(details.getByText("River", { exact: true })).toBeVisible();
  await expect(details.getByText("High urgency")).toBeVisible();
  await expect(details.getByText("5000 Forbes Avenue, Pittsburgh, PA 15213")).toBeVisible();
  await expect(details.getByRole("img", { name: `Photo of ${title}` })).toBeVisible();
  await expect(page.locator(`.spot-pin[title="${title}"]`)).toBeVisible();

  // Confirm it is still dirty: once per user.
  await details.getByRole("button", { name: "Confirm still dirty" }).click();
  await expect(details.getByRole("button", { name: "You confirmed it" })).toBeDisabled();
  await expect(details.getByText("1 person has confirmed it is still dirty.")).toBeVisible();
  expect(errors).toEqual([]);
});
