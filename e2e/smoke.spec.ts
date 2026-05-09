import { test, expect } from "@playwright/test";

test("landing loads and links to agent", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /The Shopping App/i })).toBeVisible();
  await page.getByRole("link", { name: /Start Agent/i }).click();
  await expect(page).toHaveURL(/\/agent/);
});
