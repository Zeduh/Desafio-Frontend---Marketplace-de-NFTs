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

test("promoções apresentam os cards estáticos do design e direcionam ao catálogo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const promos = page.getByRole("region", { name: "Promoções" });
  await expect(promos.getByRole("heading", { level: 3 })).toHaveText([
    "Lançamentos gênesis de edição limitada",
    "Arte digital selecionada e muito mais",
  ]);
  const promoArtworks = promos.getByRole("img");
  await expect(promoArtworks).toHaveCount(2);
  await expect(promoArtworks.nth(1)).toHaveAttribute("src", /neon-vessel/);
  await expect(promoArtworks.nth(1)).toHaveCSS("border-top-right-radius", "18px");
  await expect(promos.getByRole("link", { name: "Explorar" })).toHaveCount(2);
  await expect(promos.getByRole("link", { name: "Explorar" }).first()).toHaveAttribute(
    "href",
    "#products",
  );
  await expect(promos.locator(".home-promo-card")).toHaveCount(2);

  const cardBounds = await promos.locator(".home-promo-card").evaluateAll((cards) =>
    cards.map((card) => {
      const { x, y, width, height } = card.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );

  expect(cardBounds[0].y).toBe(cardBounds[1].y);
  expect(cardBounds[0].height).toBe(250);
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
  await expect(page.getByRole("link", { name: "EXPLORAR", exact: true })).toHaveAttribute(
    "href",
    "#products",
  );
  await expect(page.locator(".home-hero__cta-arrow")).toBeHidden();
  await expect(page.locator(".site-footer")).toHaveCount(0);
  await expect(page.locator(".home-hero__art")).toBeVisible();
  await expect(page.locator(".home-hero__art-featured")).toBeHidden();

  const heroArtwork = page.getByRole("img", {
    name: "Macaco com óculos escuros e jaqueta verde",
  });
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
  await expect(page.getByRole("link", { name: "EXPLORAR", exact: true })).toBeVisible();
  await expect(page.locator(".home-hero__cta-arrow")).toBeVisible();
  const featuredArtwork = page.locator(".home-hero__art-featured");
  await expect(featuredArtwork).toBeVisible();
  expect(
    await featuredArtwork.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    }),
  ).toEqual({ width: 42, height: 42 });
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

test("promoções se organizam em uma coluna em telas estreitas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const cards = page.locator(".home-promo-card");
  await expect(cards).toHaveCount(2);
  const cardBounds = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const { y, bottom } = element.getBoundingClientRect();
      return { y, bottom };
    }),
  );

  expect(cardBounds).toHaveLength(2);
  expect(cardBounds[1].y).toBeGreaterThanOrEqual(cardBounds[0].bottom);
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
