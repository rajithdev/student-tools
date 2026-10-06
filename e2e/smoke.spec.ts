import { test, expect } from "@playwright/test";
import { tools, staticPages } from "../src/lib/tools";

const toolPaths = tools.map((t) => `/${t.slug}/`);

for (const path of ["/", ...toolPaths, ...staticPages.map((p) => `/${p.slug}/`)]) {
  test(`${path} renders with one H1, canonical and no horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https?:\/\//);
    expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("index");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, "page should not scroll horizontally").toBe(false);
    expect(errors).toEqual([]);
  });
}

test("404 page returns 404 status", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText(/not exist|not found/i);
});

test("robots.txt, sitemap.xml and manifest are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const p of toolPaths) expect(xml).toContain(p);
  expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
  expect((await request.get("/og.png")).status()).toBe(200);
});

test("attendance calculator computes, updates the URL and restores from it", async ({ page }) => {
  await page.goto("/attendance-calculator/");
  await page.getByLabel("Classes attended").fill("36");
  await page.getByLabel("Classes held").fill("50");
  const status = page.getByRole("status").first();
  await expect(status).toContainText("72.00");
  await expect(status).toContainText("Attend the next 6 classes");
  await expect.poll(() => page.url()).toContain("a=36");
  await page.getByRole("button", { name: "80%" }).click();
  await expect(status).toContainText("Attend the next 20 classes");
  // Deep link restores state
  await page.goto("/attendance-calculator/?a=48&t=60");
  await expect(page.getByRole("status").first()).toContainText("You can miss the next 4 classes");
});

test("classes-can-miss planner shows remaining-classes feasibility", async ({ page }) => {
  await page.goto("/how-many-classes-can-i-miss/?a=30&t=50&rem=20");
  await expect(page.getByText(/Even if you attend every remaining class/)).toBeVisible();
});

test("final grade calculator needs 92% in the worked example", async ({ page }) => {
  await page.goto("/final-grade-calculator/?c=82&w=30&g=85");
  await expect(page.getByRole("status").first()).toContainText("92");
});

test("CGPA converter shows all formulas for comparison", async ({ page }) => {
  await page.goto("/cgpa-to-percentage/?v=8.2");
  const status = page.getByRole("status").first();
  await expect(status).toContainText("77.9");
  await expect(page.getByRole("table").filter({ hasText: "(CGPA − 0.75) × 10" }).first()).toBeVisible();
});

test("theme toggle switches data-theme and persists", async ({ page }) => {
  await page.goto("/");
  const before = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  const after = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  expect(after).not.toBe(before);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-theme"))).toBe(after);
});

test("keyboard: tab reaches the first input and skip link works", async ({ page }) => {
  await page.goto("/attendance-calculator/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.url()).toContain("#main");
});
