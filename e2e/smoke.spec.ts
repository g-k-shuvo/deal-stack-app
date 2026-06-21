import { test, expect } from "@playwright/test";

// Critical-path E2E (PRD §19.2). Runs against the built app with the mock AI
// provider (DCC_AI_MODE=mock) + seeded in-memory repo — hermetic, no external services.

test("dashboard loads with seeded KPIs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Welcome back, Rich/)).toBeVisible();
  await expect(page.getByText("Skills run")).toBeVisible();
  await expect(page.getByText("Total deliverables")).toBeVisible();
});

test("directory filters by type", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByText("Midwest HVAC Services, LLC")).toBeVisible();
  await page.getByRole("button", { name: "Buy-side" }).click();
  await expect(page.getByText("Apex Distribution Partners")).toBeVisible();
  await expect(page.getByText("Midwest HVAC Services, LLC")).toHaveCount(0);
});

test("run the CIM skill end to end (generate → save)", async ({ page }) => {
  await page.goto("/projects/p-midwest/skills/sell.cim");
  const genBtn = page.getByRole("button", { name: /Generate CIM generator/ });
  await expect(genBtn).toBeVisible();
  await genBtn.click();
  await expect(page.getByText("CONFIDENTIAL INFORMATION MEMORANDUM")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Output · Version 1/)).toBeVisible();
  await page.getByRole("button", { name: "Save to library" }).click();
  await expect(page.getByText(/Saved:/)).toBeVisible();
});

test("revision adds a version", async ({ page }) => {
  await page.goto("/projects/p-midwest/skills/sell.teaser");
  await page.getByRole("button", { name: /Generate Teaser generator/ }).click();
  await expect(page.getByText(/Output · Version 1/)).toBeVisible({ timeout: 15000 });
  await page.getByPlaceholder(/Request a revision/).fill("Make it punchier");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(/Output · Version 2/)).toBeVisible({ timeout: 15000 });
});

test("buy-side skill routes through the project picker", async ({ page }) => {
  await page.goto("/skills?side=buy");
  await page
    .getByRole("link", { name: "Run skill" })
    .first()
    .click();
  await expect(page.getByText(/Choose which buy-side project/)).toBeVisible();
  await page.getByText("Apex Distribution Partners").click();
  await expect(page.getByText(/Step \d of \d/)).toBeVisible();
});

test("global search finds a project", async ({ page }) => {
  await page.goto("/search?q=midwest");
  await expect(page.getByText(/Results for/)).toBeVisible();
  await expect(page.locator(".proj-name", { hasText: "Midwest HVAC" })).toBeVisible();
});

test("firm profile edit persists", async ({ page }) => {
  await page.goto("/settings");
  await page.getByText("Firm profile", { exact: true }).click();
  const input = page.locator('input[name="name"]');
  await input.fill("Jackim Woods & Co. (E2E)");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.goto("/settings");
  await page.getByText("Firm profile", { exact: true }).click();
  await expect(page.locator('input[name="name"]')).toHaveValue("Jackim Woods & Co. (E2E)");
});
