import { expect, test } from "@playwright/test";

test("logged-out header shows Log in and Sign up", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Log in" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Sign up" })).toBeVisible();
});

test("sign-up form shows validation errors without sending an email", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Username").fill("No Spaces!");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByLabel("Confirm password").fill("different");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText(/^Username must be/)).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
  await expect(page.getByText("Passwords do not match.")).toBeVisible();
  await expect(page.getByText("Check your email!")).toBeHidden();
  // What the user typed is kept.
  await expect(page.getByLabel("Email")).toHaveValue("not-an-email");
});

for (const path of ["/profile", "/dashboard"]) {
  test(`${path} redirects to login when logged out`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(`/login?next=${encodeURIComponent(path)}`);
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });
}

test("login with wrong credentials shows an error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody-e2e@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Wrong email or password.");
});

test("confirmation link errors send the user to login with a message", async ({ page }) => {
  await page.goto("/auth/confirm?error=access_denied&error_code=otp_expired");
  await expect(page).toHaveURL("/login?error=link");
  await expect(page.getByText(/invalid or has expired/)).toBeVisible();
});

// Full login → profile → logout flow, with a confirmed test user created by hand in Supabase.
test("test user can log in, see their profile and log out", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  test.skip(!email || !password, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run");

  await page.goto("/profile");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/profile");
  await expect(page.getByRole("heading", { name: "My profile" })).toBeVisible();
  await expect(page.getByLabel("Username")).not.toHaveValue("");
  await expect(page.getByRole("banner").getByRole("link", { name: /My profile/ })).toBeVisible();

  // Edit the profile: home area + home pin on the map.
  const area = `Oakland ${Date.now() % 1000}`;
  await page.getByLabel("Home area").fill(area);
  await page.locator(".leaflet-container").click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved ✓")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Home area")).toHaveValue(area);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("banner").getByRole("link", { name: "Log in" })).toBeVisible();
});
