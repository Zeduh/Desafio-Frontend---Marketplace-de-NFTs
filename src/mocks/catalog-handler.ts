import { HttpResponse, http } from "msw";
import { apiBaseUrl } from "../lib/api-client";
import type {
  CatalogFacet,
  Product,
  ProductTab,
  SortOrder,
} from "../features/catalog/types";
import { catalogProducts, collectionNames, featuredProduct, networkNames } from "./fixtures/catalog";

const DEFAULT_MIN_PRICE = "0.02";
const DEFAULT_MAX_PRICE = "12.30";
const MAX_PRICE = "20.00";
const DEFAULT_MIN_PRICE_CENTS = 2n;
const DEFAULT_MAX_PRICE_CENTS = 1230n;
const PAGE_SIZE_MAX = 50;

function parseCents(value: string) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) {
    return null;
  }

  return BigInt(`${match[1]}${(match[2] ?? "").padEnd(2, "0")}`);
}

function getPriceCents(product: Product) {
  return product.price === null ? null : parseCents(product.price);
}

function getFacetCounts(products: Product[], values: string[], property: "collection" | "network") {
  return values.map<CatalogFacet>((value) => ({
    value,
    count: products.filter((product) => product[property] === value).length,
  }));
}

function matchesPriceRange(product: Product, minimum: bigint, maximum: bigint) {
  const price = getPriceCents(product);
  if (price === null) {
    return minimum === DEFAULT_MIN_PRICE_CENTS && maximum >= DEFAULT_MAX_PRICE_CENTS;
  }

  return price >= minimum && price <= maximum;
}

export const catalogHandler = http.get(`${apiBaseUrl}/nfts`, ({ request }) => {
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 9);
  const minPrice = params.get("minPrice") ?? DEFAULT_MIN_PRICE;
  const maxPrice = params.get("maxPrice") ?? DEFAULT_MAX_PRICE;
  const minimum = parseCents(minPrice);
  const maximum = parseCents(maxPrice);
  const maximumAllowed = parseCents(MAX_PRICE);
  const sort = params.get("sort") ?? "recent";
  const tab = params.get("tab") ?? "all";

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > PAGE_SIZE_MAX ||
    minimum === null ||
    maximum === null ||
    maximumAllowed === null ||
    minimum < DEFAULT_MIN_PRICE_CENTS ||
    maximum > maximumAllowed ||
    minimum > maximum ||
    !["recent", "price-low", "price-high"].includes(sort) ||
    !["all", "new", "trending"].includes(tab)
  ) {
    return HttpResponse.json(
      { error: { code: "INVALID_CATALOG_QUERY", message: "Parâmetros de catálogo inválidos." } },
      { status: 400 },
    );
  }

  const query = (params.get("q") ?? "").trim().toLocaleLowerCase("pt-BR");
  const collections = params.getAll("collection");
  const networks = params.getAll("network");
  const selectedTab = tab as ProductTab;
  const sortOrder = sort as SortOrder;
  const restrictedPrice =
    minimum > DEFAULT_MIN_PRICE_CENTS || maximum < DEFAULT_MAX_PRICE_CENTS;

  const matchesSearch = (product: Product) =>
    !query ||
    [product.name, product.collection, product.network]
      .some((value) => value?.toLocaleLowerCase("pt-BR").includes(query));
  const matchesPrice = (product: Product) =>
    !restrictedPrice || matchesPriceRange(product, minimum, maximum);
  const matchesTab = (product: Product) =>
    selectedTab === "all" ||
    (selectedTab === "new" && product.isNew) ||
    (selectedTab === "trending" && product.isTrending);
  const matchesSearchAndPrice = (product: Product) =>
    matchesSearch(product) && matchesPrice(product);
  const matchesCollection = (product: Product) =>
    collections.length === 0 || collections.includes(product.collection);
  const matchesNetwork = (product: Product) =>
    networks.length === 0 || networks.includes(product.network);

  const searchAndPriceFiltered = catalogProducts.filter(matchesSearchAndPrice);
  const tabFacetProducts = searchAndPriceFiltered.filter(
    (product) => matchesCollection(product) && matchesNetwork(product),
  );
  const baseFiltered = searchAndPriceFiltered.filter(matchesTab);
  const filtered = baseFiltered.filter(
    (product) => matchesCollection(product) && matchesNetwork(product),
  );
  const collectionFacetProducts = baseFiltered.filter(matchesNetwork);
  const networkFacetProducts = baseFiltered.filter(matchesCollection);

  if (sortOrder === "price-low" || sortOrder === "price-high") {
    const direction = sortOrder === "price-low" ? 1 : -1;
    filtered.sort((first, second) => {
      const firstPrice = getPriceCents(first);
      const secondPrice = getPriceCents(second);
      if (firstPrice === null) return 1;
      if (secondPrice === null) return -1;
      if (firstPrice === secondPrice) return 0;
      return firstPrice < secondPrice ? -direction : direction;
    });
  }

  const start = (page - 1) * pageSize;
  return HttpResponse.json({
    items: filtered.slice(start, start + pageSize),
    featured: featuredProduct,
    total: filtered.length,
    page,
    pageSize,
    facets: {
      collections: getFacetCounts(collectionFacetProducts, collectionNames, "collection"),
      networks: getFacetCounts(networkFacetProducts, networkNames, "network"),
      tabs: {
        all: tabFacetProducts.length,
        new: tabFacetProducts.filter((product) => product.isNew).length,
        trending: tabFacetProducts.filter((product) => product.isTrending).length,
      },
    },
  });
});
