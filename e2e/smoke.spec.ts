import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("GET /api/health returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });

  test("login page renders for unauthenticated session", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});
