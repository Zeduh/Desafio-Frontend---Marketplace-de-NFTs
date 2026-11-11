import { expect, test } from "@playwright/test";

test("home apresenta as seções na ordem definida pelo design", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "SEJA DONO DO FUTURO DA ARTE DIGITAL",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Produtos",
    "Promoções",
    "Blog",
  ]);
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(20, 13, 10)");
});

test("Top desktop apresenta a navegação e o conteúdo exportados do Figma", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "KURIO" })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(navigation.getByText("Início")).toBeVisible();
  await expect(navigation.getByText("Mercado")).toBeVisible();
  await expect(navigation.getByText("Criadores")).toBeVisible();
  await expect(navigation.getByText("Aprenda")).toBeVisible();
  await expect(page.getByText("Bem-vindo à Kurio")).toBeVisible();
  await expect(
    page.getByText(/Discover curated NFTs from emerging and established creators\./),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar" })).toHaveAttribute(
    "href",
    "#products",
  );
  await expect(page.locator(".home-hero__cta-arrow")).toBeHidden();
  await expect(page.locator(".site-footer")).toHaveCount(0);
  await expect(page.locator(".home-hero__art")).toBeVisible();

  const heroArtwork = page.locator(".home-hero__art img");
  await expect(heroArtwork).toBeVisible();
  await expect(heroArtwork).toHaveAttribute(
    "alt",
    "Macaco com óculos escuros e jaqueta verde",
  );
  const naturalWidth = await heroArtwork.evaluate((element) =>
    element instanceof HTMLImageElement ? element.naturalWidth : 0,
  );
  expect(naturalWidth).toBeGreaterThan(0);
});

test("Top mantém as dimensões desktop indicadas no CSS do Figma", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const layout = await page.locator(".home-hero").evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      width: element.getBoundingClientRect().width,
      columns: styles.gridTemplateColumns,
      columnGap: styles.columnGap,
      fontFamily: styles.fontFamily,
    };
  });

  expect(layout.width).toBe(1200);
  expect(layout.columns).toBe("600px 450px");
  expect(layout.columnGap).toBe("110px");
  expect(layout.fontFamily).toContain("Roboto Mono");
});

test("Top mobile usa a barra de busca e o hero próprios do layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("searchbox", { name: "Explorar coleções" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Filtros" })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "SEJA DONO DA CULTURA DIGITAL",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Descubra NFTs selecionados de criadores do mundo todo."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar" })).toBeVisible();
  await expect(page.locator(".home-hero__cta-arrow")).toBeVisible();
  await expect(page.locator(".site-footer")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toBeHidden();

  const productGridColumnCount = await page
    .locator(".home-placeholder-grid")
    .first()
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);

  expect(productGridColumnCount).toBe(2);
});

for (const width of [390, 768, 1440]) {
  test(`home não apresenta overflow horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hasHorizontalOverflow).toBe(false);
  });
}

test("link de pular conteúdo usa o componente acessível do design system", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" });

  await expect(skipLink).toHaveAttribute("data-slot", "button");
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
});
