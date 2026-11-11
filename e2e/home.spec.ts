import { expect, test } from "@playwright/test";

test("home apresenta as seções na ordem definida pelo design", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Destaques" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Produtos",
    "Promoções",
    "Blog",
  ]);
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(20, 13, 10)");
});

test("link de pular conteúdo usa o componente acessível do design system", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" });

  await expect(skipLink).toHaveAttribute("data-slot", "button");
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
});
