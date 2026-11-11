import { expect, test } from "@playwright/test";

test("inicia a aplicação e responde pela API simulada", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Base do marketplace configurada" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("API simulada ativa (mock)");
});
