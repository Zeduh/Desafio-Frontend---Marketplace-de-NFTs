import { expect, test } from "@playwright/test";

test("API simulada filtra e pagina o catálogo com metadados de facetas", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  const catalog = await page.evaluate(async () => {
    const filteredResponse = await fetch(
      "/api/nfts?collection=Arte+digital&network=Polygon&sort=price-low&page=1&pageSize=9",
    );
    const networkResponse = await fetch("/api/nfts?network=Polygon&pageSize=50");
    const collectionResponse = await fetch("/api/nfts?collection=Arte+digital&pageSize=50");
    const pageResponse = await fetch("/api/nfts?page=2&pageSize=9");
    return {
      filtered: {
        status: filteredResponse.status,
        body: await filteredResponse.json(),
      },
      network: await networkResponse.json(),
      collection: await collectionResponse.json(),
      page: {
        status: pageResponse.status,
        body: await pageResponse.json(),
      },
    };
  });

  expect(catalog.filtered.status).toBe(200);
  expect(catalog.filtered.body.total).toBeGreaterThan(0);
  expect(catalog.filtered.body.items.length).toBe(catalog.filtered.body.total);
  expect(
    catalog.filtered.body.items.every(
      (product: { collection: string; network: string }) =>
        product.collection === "Arte digital" && product.network === "Polygon",
    ),
  ).toBe(true);
  expect(
    catalog.filtered.body.facets.collections.some(
      (facet: { value: string; count: number }) =>
        facet.value === "Arte digital" &&
        facet.count === catalog.network.items.filter(
          (product: { collection: string }) => product.collection === "Arte digital",
        ).length,
    ),
  ).toBe(true);
  expect(
    catalog.filtered.body.facets.networks.some(
      (facet: { value: string; count: number }) =>
        facet.value === "Polygon" &&
        facet.count === catalog.collection.items.filter(
          (product: { network: string }) => product.network === "Polygon",
        ).length,
    ),
  ).toBe(true);
  expect(catalog.page.status).toBe(200);
  expect(catalog.page.body.page).toBe(2);
  expect(catalog.page.body.items).toHaveLength(9);
});

test("Produtos desktop apresenta sidebar, destaque e grade paginada", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  await expect(products.getByRole("complementary", { name: "Filtros de produtos" })).toBeVisible();
  await expect(products.getByRole("heading", { name: "NFT EM DESTAQUE" })).toBeVisible();
  await expect(products.getByText("OFERTA LIMITADA")).toBeVisible();
  await expect(products.getByRole("list", { name: "NFTs" }).getByRole("listitem")).toHaveCount(
    9,
  );
  await expect(products.getByRole("tab", { name: "Todos os NFTs" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(products.getByRole("navigation", { name: "Paginação de produtos" })).toBeVisible();

  const layout = await products.locator(".products-layout").evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      width: element.getBoundingClientRect().width,
      columns: styles.gridTemplateColumns,
      gap: styles.columnGap,
    };
  });
  expect(layout.width).toBe(1200);
  expect(layout.columns).toBe("310px 842px");
  expect(layout.gap).toBe("48px");

  const artworkImages = await products.getByRole("list", { name: "NFTs" }).locator("img").all();
  for (const image of artworkImages) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) =>
          element instanceof HTMLImageElement ? element.naturalWidth : 0,
        ),
      )
      .toBeGreaterThan(0);
  }
});

test("catálogo mantém o espaço dos skeletons e respeita movimento reduzido", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const requestUrls = new WeakMap<XMLHttpRequest, string>();
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
      requestUrls.set(this, String(url));
      return originalOpen.call(this, method, url, async, username, password);
    };
    XMLHttpRequest.prototype.send = function (body) {
      if (new URL(requestUrls.get(this) ?? "", window.location.href).pathname === "/api/nfts") {
        window.setTimeout(() => originalSend.call(this, body), 1200);
        return;
      }

      return originalSend.call(this, body);
    };
  });
  await page.goto("/");

  const nftList = page.getByRole("list", { name: "NFTs" });
  await expect(nftList).toHaveAttribute("aria-busy", "true");
  const skeletonArt = nftList
    .locator(".products-card--skeleton")
    .first()
    .locator(".products-card__art");
  await expect(nftList.locator(".products-card--skeleton")).toHaveCount(9);
  const skeletonBounds = await skeletonArt.boundingBox();
  if (!skeletonBounds) {
    throw new Error("O skeleton do catálogo não está disponível para validação.");
  }
  await expect
    .poll(() => skeletonArt.evaluate((element) => getComputedStyle(element).animationName))
    .toBe("none");

  await expect(nftList.locator(".products-card--skeleton")).toHaveCount(0);
  await expect(nftList).toHaveAttribute("aria-busy", "false");
  const loadedArtBounds = await nftList.locator(".products-card__art").first().boundingBox();
  if (!loadedArtBounds) {
    throw new Error("A arte carregada do catálogo não está disponível para validação.");
  }
  expect(loadedArtBounds.width).toBeCloseTo(skeletonBounds.width, 1);
  expect(loadedArtBounds.height).toBeCloseTo(skeletonBounds.height, 1);
});

test("Produtos mobile oculta sidebar e destaque e mostra grade em duas colunas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  await expect(products.getByRole("complementary", { name: "Filtros de produtos" })).toBeHidden();
  await expect(products.getByRole("heading", { name: "NFT EM DESTAQUE" })).toBeHidden();
  await expect(products.getByRole("list", { name: "NFTs" }).getByRole("listitem")).toHaveCount(
    9,
  );
  await expect(page.getByRole("navigation", { name: "Navegação inferior" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Filtros" })).toBeEnabled();

  const gridColumnCount = await products
    .getByRole("list", { name: "NFTs" })
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  expect(gridColumnCount).toBe(2);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole("button", { name: "Filtros" }).click();
  const filtersDialog = page.getByRole("dialog", { name: "Filtros de produtos" });
  await expect(filtersDialog).toBeVisible();
  await expect(filtersDialog.getByRole("spinbutton")).toHaveCount(0);
  const minimumSlider = filtersDialog.getByRole("slider", { name: "Preço mínimo" });
  await minimumSlider.press("ArrowRight");
  await expect(filtersDialog.getByText("Preço: 0,03 - 12,30 ETH")).toBeVisible();
  await filtersDialog.getByRole("button", { name: "Aplicar" }).click();
  await expect(filtersDialog).toBeHidden();
  await expect(products.getByRole("list", { name: "NFTs" }).getByRole("listitem")).toHaveCount(
    9,
  );

  await page.getByRole("button", { name: "Filtros" }).click();
  await expect(filtersDialog).toBeVisible();
  await page.getByRole("button", { name: "Fechar filtros" }).click();
  await expect(filtersDialog).toBeHidden();

  const filterTrigger = page.getByRole("button", { name: "Filtros" });
  await filterTrigger.click();
  await expect(filtersDialog).toBeVisible();
  await filtersDialog.getByRole("button", { name: /Todas as coleções/ }).focus();
  await page.keyboard.press("Escape");
  await expect(filtersDialog).toBeHidden();
  await expect(filterTrigger).toBeFocused();
});

test("Produtos mantém duas colunas e sem overflow em telas compactas", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const grid = products.getByRole("list", { name: "NFTs" });
  const gridColumnCount = await grid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(gridColumnCount).toBe(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test("abas, filtros e ordenação consultam o catálogo pela API", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });

  const newTab = products.getByRole("tab", { name: "Novos lançamentos" });
  await products.getByRole("tab", { name: "Todos os NFTs" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(newTab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(newTab).toHaveAttribute("aria-selected", "true");
  await newTab.click();
  await expect(products.getByRole("tab", { name: "Novos lançamentos" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(products.getByRole("tab", { name: "Em alta" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
  await expect(nftList.getByRole("listitem")).toHaveCount(9);
  await expect(
    products.getByRole("navigation", { name: "Paginação de produtos" }).getByRole("button", {
      name: "Página 2",
    }),
  ).toBeVisible();
  await products.getByRole("tab", { name: "Em alta" }).click();
  await expect(products.getByRole("tab", { name: "Novos lançamentos" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
  await expect(products.getByRole("tab", { name: "Em alta" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(nftList.getByRole("listitem")).toHaveCount(9);
  await products.getByRole("tab", { name: "Todos os NFTs" }).click();

  const sortControl = products.getByRole("combobox", { name: "Ordenar por" });
  await sortControl.click();
  await page.getByRole("option", { name: "Menor preço" }).click();
  await expect(sortControl).toContainText("Menor preço");
  await expect(nftList.getByRole("listitem").first().getByRole("article")).toHaveAttribute(
    "aria-label",
    "Golden Signal #160",
  );
  await products.getByRole("button", { name: /Música/ }).click();
  await expect(nftList.getByRole("listitem")).toHaveCount(4);
});

test("busca desktop filtra pela API e atualiza o estado da URL", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  await page.getByRole("button", { name: "Buscar NFTs" }).click();
  const search = page.getByRole("searchbox", { name: "Buscar NFTs" });
  await expect(search).toBeFocused();
  await search.fill("Golden Signal");

  await expect(page).toHaveURL(/[?&]q=Golden(?:\+|%20)Signal/);
  const nftList = page.getByRole("list", { name: "NFTs" });
  await expect(nftList.getByRole("listitem")).toHaveCount(1);
  await expect(nftList.getByRole("article", { name: "Golden Signal #160" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(search).toBeHidden();
  await page.getByRole("button", { name: "Buscar NFTs" }).click();
  await expect(search).toHaveValue("Golden Signal");
});

test("busca mobile filtra pela API pela barra da Home", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const search = page.getByRole("searchbox", { name: "Explorar coleções" });
  await search.fill("Golden Beat");
  await expect(page).toHaveURL(/[?&]q=Golden(?:\+|%20)Beat/);

  const nftList = page.getByRole("list", { name: "NFTs" });
  await expect(nftList.getByRole("listitem")).toHaveCount(1);
  await expect(nftList.getByRole("article", { name: "Golden Beat #207" })).toBeVisible();
});

test("estado do catálogo é hidratado da URL e filtros reiniciam a página", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(
    "/?tab=new&sort=price-low&page=2",
  );

  const products = page.getByRole("region", { name: "Produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  const filterPanel = products.getByRole("complementary", { name: "Filtros de produtos" });
  const pagination = products.getByRole("navigation", { name: "Paginação de produtos" });

  await expect(products.getByRole("tab", { name: "Novos lançamentos" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    products.getByRole("combobox", { name: "Ordenar por" }),
  ).toContainText("Menor preço");
  await expect(pagination.getByRole("button", { name: "Página 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(nftList.getByRole("listitem")).toHaveCount(8);

  await filterPanel.getByRole("button", { name: /Arte digital/ }).click();
  await expect(filterPanel.getByRole("button", { name: /Arte digital/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(pagination.getByRole("button", { name: "Página 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page).not.toHaveURL(/[?&]page=2(?:&|$)/);

  await filterPanel.getByRole("button", { name: /Fotografia/ }).click();
  await expect(filterPanel.getByRole("button", { name: /Fotografia/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.goBack();
  await expect(filterPanel.getByRole("button", { name: /Fotografia/ })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(filterPanel.getByRole("button", { name: /Arte digital/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.goBack();
  await expect(filterPanel.getByRole("button", { name: /Arte digital/ })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(pagination.getByRole("button", { name: "Página 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("filtro de preço é somente leitura e aplica o intervalo do slider", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  const filterPanel = products.getByRole("complementary", { name: "Filtros de produtos" });
  await expect(filterPanel.getByRole("spinbutton")).toHaveCount(0);

  const minimumSlider = filterPanel.getByRole("slider", { name: "Preço mínimo" });
  const maximumSlider = filterPanel.getByRole("slider", { name: "Preço máximo" });
  await minimumSlider.press("End");
  await expect
    .poll(async () => Number(await minimumSlider.getAttribute("aria-valuenow")))
    .toBeCloseTo(12.29, 2);
  await maximumSlider.press("Home");
  await expect(filterPanel.getByText("Preço: 12,29 - 12,30 ETH")).toBeVisible();
  await expect(nftList.getByRole("listitem")).toHaveCount(9);

  await products.getByRole("button", { name: "Aplicar" }).first().click();
  await expect(nftList).toBeEmpty();
  await expect(products.locator(".products-empty")).toHaveText(
    "Nenhum NFT encontrado para os filtros selecionados.",
  );
  await expect(
    products.getByRole("navigation", { name: "Paginação de produtos" }),
  ).toHaveCount(0);
});

test("filtro de preço respeita o espaçamento do Figma", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const filterPanel = page
    .getByRole("region", { name: "Produtos" })
    .getByRole("complementary", { name: "Filtros de produtos" });
  const headingToControlsGap = await filterPanel
    .locator(".products-filters__group--price")
    .evaluate((group) => {
      const heading = group.querySelector("legend");
      const controls = group.querySelector(".products-filters__controls");
      if (!heading || !controls) {
        throw new Error("Os elementos do filtro de preço não estão disponíveis.");
      }

      return controls.getBoundingClientRect().top - heading.getBoundingClientRect().bottom;
    });

  expect(headingToControlsGap).toBe(12);
});

test("as duas alças do preço podem ser arrastadas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const filterPanel = page.getByRole("complementary", { name: "Filtros de produtos" });
  const minimumSlider = filterPanel.getByRole("slider", { name: "Preço mínimo" });
  const maximumSlider = filterPanel.getByRole("slider", { name: "Preço máximo" });
  await minimumSlider.scrollIntoViewIfNeeded();
  const minimumBounds = await minimumSlider.boundingBox();
  const maximumBounds = await maximumSlider.boundingBox();
  const trackBounds = await filterPanel
    .locator('.products-filters__range [data-slot="slider-track"]')
    .boundingBox();
  if (!minimumBounds || !maximumBounds || !trackBounds) {
    throw new Error("Os controles de preço não estão disponíveis para interação.");
  }

  await page.mouse.move(
    minimumBounds.x + minimumBounds.width / 2,
    minimumBounds.y + minimumBounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    trackBounds.x + trackBounds.width * 0.5,
    trackBounds.y + trackBounds.height / 2,
  );
  await page.mouse.up();
  await expect
    .poll(async () => Number(await minimumSlider.getAttribute("aria-valuenow")))
    .toBeGreaterThan(9.5);
  await expect
    .poll(async () => Number(await minimumSlider.getAttribute("aria-valuenow")))
    .toBeLessThan(10.5);

  await page.mouse.move(
    maximumBounds.x + maximumBounds.width / 2,
    maximumBounds.y + maximumBounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    trackBounds.x + trackBounds.width * 0.75,
    trackBounds.y + trackBounds.height / 2,
  );
  await page.mouse.up();
  await expect
    .poll(async () => Number(await maximumSlider.getAttribute("aria-valuenow")))
    .toBeGreaterThan(14.5);
});

test("paginação percorre os NFTs da API e esconde controles nos limites", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  const pagination = products.getByRole("navigation", { name: "Paginação de produtos" });

  await expect(nftList.getByRole("listitem")).toHaveCount(9);
  await expect(pagination.getByRole("button", { name: "Página anterior" })).toHaveCount(0);
  await expect(pagination.getByRole("button", { name: "Próxima página" })).toBeEnabled();
  const productsMainBounds = await products.locator(".products-main").boundingBox();
  const paginationListBounds = await pagination.locator(".products-pagination__list").boundingBox();
  if (!productsMainBounds || !paginationListBounds) {
    throw new Error("Os limites do catálogo ou da paginação não estão disponíveis.");
  }
  expect(paginationListBounds.x + paginationListBounds.width).toBeCloseTo(
    productsMainBounds.x + productsMainBounds.width,
    0,
  );
  const pageOneBounds = await pagination.getByRole("button", { name: "Página 1" }).boundingBox();
  if (!pageOneBounds) {
    throw new Error("O botão da primeira página não está disponível para validação.");
  }

  await pagination.getByRole("button", { name: "Página 2" }).click();
  await expect(pagination.getByRole("button", { name: "Página anterior" })).toBeEnabled();
  await expect(pagination.getByRole("button", { name: "Página 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const pageOneBoundsAfterNavigation = await pagination
    .getByRole("button", { name: "Página 1" })
    .boundingBox();
  if (!pageOneBoundsAfterNavigation) {
    throw new Error("O botão da primeira página não está disponível após navegar.");
  }
  expect(pageOneBoundsAfterNavigation.x).toBeCloseTo(pageOneBounds.x, 1);
  await expect
    .poll(() => products.evaluate((section) => section.getBoundingClientRect().top))
    .toBeLessThan(0);
  await expect(nftList.getByRole("listitem")).toHaveCount(9);
  await expect(
    nftList.getByRole("article", { name: /Arte digital #/ }).first(),
  ).toBeVisible();

  await pagination.getByRole("button", { name: "Página 4" }).click();
  await expect(nftList.getByRole("listitem")).toHaveCount(9);
  await expect(nftList.getByRole("article", { name: /Utilidade #/ }).first()).toBeVisible();
  await expect(pagination.getByRole("button", { name: "Próxima página" })).toHaveCount(0);
  const pageFourBounds = await pagination.getByRole("button", { name: "Página 4" }).boundingBox();
  if (!pageFourBounds) {
    throw new Error("O botão da última página não está disponível para validação.");
  }
  await pagination.getByRole("button", { name: "Página 3" }).click();
  await expect(pagination.getByRole("button", { name: "Página 3" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const pageFourBoundsAfterNavigation = await pagination
    .getByRole("button", { name: "Página 4" })
    .boundingBox();
  if (!pageFourBoundsAfterNavigation) {
    throw new Error("O botão da última página não está disponível após navegar.");
  }
  expect(pageFourBoundsAfterNavigation.x).toBeCloseTo(pageFourBounds.x, 1);
  await pagination.getByRole("button", { name: "Página 4" }).click();
  await expect(pagination.getByRole("button", { name: "Próxima página" })).toHaveCount(0);

  await pagination.getByRole("button", { name: "Página 2" }).click();
  await expect(pagination.getByRole("button", { name: "Próxima página" })).toBeEnabled();

  await products.getByRole("button", { name: /Música/ }).click();
  await expect(nftList.getByRole("listitem")).toHaveCount(4);
  await expect(pagination.getByRole("button", { name: "Página anterior" })).toHaveCount(0);
  await expect(pagination.getByRole("button", { name: "Próxima página" })).toHaveCount(0);
  await expect(pagination.getByRole("button", { name: "Página 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(pagination.getByRole("button", { name: "Página 2" })).toHaveCount(0);
  await expect(nftList.getByRole("article", { name: "Golden Beat #207" })).toBeVisible();
});

test("coleções e redes usam variantes visuais e combinam seus filtros", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  const collection = products.getByRole("button", { name: /Arte digital/ });
  const network = products.getByRole("button", { name: /Polygon/ });

  await expect(collection).toHaveClass(/products-filters__option--collection/);
  await expect(network).toHaveClass(/products-filters__option--network/);
  await collection.click();
  await network.click();

  await expect(collection).toHaveAttribute("aria-pressed", "true");
  await expect(network).toHaveAttribute("aria-pressed", "true");
  await expect(nftList.getByRole("listitem")).toHaveCount(2);

  await network.click();
  await expect(nftList.getByRole("listitem")).toHaveCount(7);
  await products.getByRole("button", { name: /Fotografia/ }).click();
  await expect(nftList.getByRole("listitem")).toHaveCount(9);
});

test("opções todas limpam filtros de coleção e rede", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const filterPanel = products.getByRole("complementary", { name: "Filtros de produtos" });
  const allCollections = filterPanel.getByRole("button", { name: /^Todas as coleções/ });
  const allNetworks = filterPanel.getByRole("button", { name: /^Todas as redes/ });

  await expect(allCollections).toHaveAttribute("aria-pressed", "true");
  await expect(allNetworks).toHaveAttribute("aria-pressed", "true");
  await filterPanel.getByRole("button", { name: /^Arte digital/ }).click();
  await filterPanel.getByRole("button", { name: /^Fotografia/ }).click();
  await expect(allCollections).toHaveAttribute("aria-pressed", "false");
  await allCollections.click();
  await expect(allCollections).toHaveAttribute("aria-pressed", "true");

  await filterPanel.getByRole("button", { name: /^Polygon/ }).click();
  await expect(allNetworks).toHaveAttribute("aria-pressed", "false");
  await allNetworks.click();
  await expect(allNetworks).toHaveAttribute("aria-pressed", "true");

  const selectedParams = await page.evaluate(() => {
    const params = new URLSearchParams(location.search);
    return {
      collections: params.getAll("collection"),
      networks: params.getAll("network"),
    };
  });
  expect(selectedParams.collections).toHaveLength(0);
  expect(selectedParams.networks).toHaveLength(0);
});

test("coleção vazia mostra estado vazio e Todas restaura o catálogo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const filterPanel = products.getByRole("complementary", { name: "Filtros de produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  const collectionOptions = filterPanel.locator(".products-filters__option--collection");
  const allCollections = filterPanel.getByRole("button", { name: /^Todas as coleções/ });
  const emptyCollection = filterPanel.getByRole("button", { name: /^Assinaturas/ });

  await expect(allCollections).toContainText("(36)");
  await expect(emptyCollection).toContainText("(0)");
  const collectionCounts = await collectionOptions
    .locator(".products-filters__count")
    .allTextContents();
  expect(new Set(collectionCounts).size).toBeGreaterThan(1);

  await emptyCollection.click();
  await expect(nftList).toBeEmpty();
  await expect(products.locator(".products-empty")).toHaveText(
    "Nenhum NFT encontrado para os filtros selecionados.",
  );

  await allCollections.click();
  await expect(allCollections).toHaveAttribute("aria-pressed", "true");
  await expect(nftList.getByRole("listitem")).toHaveCount(9);
  await expect(allCollections).toContainText("(36)");
});

test("facetas permanecem visíveis e contagens acompanham os filtros da API", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const filterPanel = products.getByRole("complementary", { name: "Filtros de produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  const allCollections = filterPanel.getByRole("button", { name: /^Todas as coleções/ });
  const allNetworks = filterPanel.getByRole("button", { name: /^Todas as redes/ });
  const collectionOptions = filterPanel.locator(".products-filters__option--collection");

  await expect(allCollections).toContainText("(36)");
  await filterPanel.getByRole("button", { name: /^Polygon/ }).click();
  await expect(filterPanel.getByRole("button", { name: /^Polygon/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(allCollections).toContainText("(12)");
  await expect(collectionOptions).toHaveCount(10);

  await filterPanel.getByRole("button", { name: /^Arte digital/ }).click();
  await expect(nftList.getByRole("listitem")).toHaveCount(2);
  await expect(collectionOptions).toHaveCount(10);

  await allCollections.click();
  await expect(allCollections).toHaveAttribute("aria-pressed", "true");
  await expect(nftList.getByRole("listitem")).toHaveCount(9);
  await expect(allCollections).toContainText("(12)");

  await allNetworks.click();
  await expect(allNetworks).toHaveAttribute("aria-pressed", "true");
  await expect(allCollections).toContainText("(36)");
});

test("múltiplas coleções selecionadas exibem a união dos produtos", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const filterPanel = products.getByRole("complementary", { name: "Filtros de produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  const digitalArt = filterPanel.getByRole("button", { name: /^Arte digital/ });
  const photography = filterPanel.getByRole("button", { name: /^Fotografia/ });
  const digitalArtCount = Number(
    (await digitalArt.locator(".products-filters__count").textContent())?.match(/\d+/)?.[0],
  );
  const photographyCount = Number(
    (await photography.locator(".products-filters__count").textContent())?.match(/\d+/)?.[0],
  );

  const countFilteredProducts = async () => {
    const pagination = products.getByRole("navigation", { name: "Paginação de produtos" });
    const pages = pagination.getByRole("button", { name: /^Página \d+$/ });
    const pageCount = await pages.count();
    if (pageCount === 0) {
      return nftList.getByRole("listitem").count();
    }

    let total = 0;
    for (let index = 0; index < pageCount; index += 1) {
      await pages.nth(index).click();
      await expect(pages.nth(index)).toHaveAttribute("aria-current", "page");
      await expect(nftList).toHaveAttribute("aria-busy", "false");
      total += await nftList.getByRole("listitem").count();
    }
    return total;
  };

  await digitalArt.click();
  await photography.click();
  await expect(digitalArt).toHaveAttribute("aria-pressed", "true");
  await expect(photography).toHaveAttribute("aria-pressed", "true");
  expect(await countFilteredProducts()).toBe(digitalArtCount + photographyCount);

  await digitalArt.click();
  await expect(digitalArt).toHaveAttribute("aria-pressed", "false");
  await expect(photography).toHaveAttribute("aria-pressed", "true");
  expect(await countFilteredProducts()).toBe(photographyCount);
});

test("quantidades de coleções e redes correspondem aos NFTs mockados", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");

  const products = page.getByRole("region", { name: "Produtos" });
  const filterPanel = products.getByRole("complementary", { name: "Filtros de produtos" });
  const nftList = products.getByRole("list", { name: "NFTs" });
  await expect(
    filterPanel.getByRole("button", { name: /^Todas as coleções/ }),
  ).toContainText("(36)");

  const countProductsAcrossPages = async () => {
    const pagination = products.getByRole("navigation", { name: "Paginação de produtos" });
    const pages = pagination.getByRole("button", { name: /^Página \d+$/ });
    const pageCount = await pages.count();
    if (pageCount === 0) {
      return nftList.getByRole("listitem").count();
    }

    let total = 0;
    for (let index = 0; index < pageCount; index += 1) {
      await pages.nth(index).click();
      await expect(pages.nth(index)).toHaveAttribute("aria-current", "page");
      await expect(nftList).toHaveAttribute("aria-busy", "false");
      total += await nftList.getByRole("listitem").count();
    }
    return total;
  };

  for (const selector of [
    ".products-filters__option--collection",
    ".products-filters__option--network",
  ]) {
    const options = filterPanel.locator(selector);
    for (let index = 0; index < await options.count(); index += 1) {
      const option = options.nth(index);
      const displayedCount = Number(
        (await option.locator(".products-filters__count").textContent())?.match(/\d+/)?.[0],
      );

      await option.click();
      if (index > 0) {
        await expect(option).toHaveAttribute("aria-pressed", "true");
      }
      await expect(nftList).toHaveAttribute("aria-busy", "false");
      expect(await countProductsAcrossPages()).toBe(displayedCount);
      await option.click();
      if (index > 0) {
        await expect(option).toHaveAttribute("aria-pressed", "false");
      }
      await expect(nftList).toHaveAttribute("aria-busy", "false");
    }
  }
});
