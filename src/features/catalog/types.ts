export type NetworkName = "Ethereum" | "Polygon" | "Solana";

export interface Product {
  id: string;
  name: string | null;
  price: string | null;
  previousPrice?: string;
  artwork: string;
  collection: string;
  network: NetworkName;
  isNew: boolean;
  isTrending: boolean;
}

export type ProductTab = "all" | "new" | "trending";
export type SortOrder = "recent" | "price-low" | "price-high";

export interface CatalogSearch {
  q?: string;
  collection?: string[];
  network?: string[];
  minPrice?: string;
  maxPrice?: string;
  tab?: ProductTab;
  sort?: SortOrder;
  page?: number;
}

export interface CatalogRequest {
  q: string;
  collections: string[];
  networks: string[];
  minPrice: string;
  maxPrice: string;
  tab: ProductTab;
  sort: SortOrder;
  page: number;
  pageSize: number;
}

export interface CatalogFacet {
  value: string;
  count: number;
}

export interface CatalogResponse {
  items: Product[];
  featured: Product;
  total: number;
  page: number;
  pageSize: number;
  facets: {
    collections: CatalogFacet[];
    networks: CatalogFacet[];
    tabs: Record<ProductTab, number>;
  };
}

const PRICE_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;
const MIN_PRICE_CENTS = 2n;
const MAX_PRICE_CENTS = 2000n;
const DEFAULT_MIN_PRICE = "0.02";
const DEFAULT_MAX_PRICE = "12.30";

function normalizePrice(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const match = PRICE_PATTERN.exec(value);
  if (!match) {
    return undefined;
  }

  const cents = BigInt(`${match[1]}${(match[2] ?? "").padEnd(2, "0")}`);
  if (cents < MIN_PRICE_CENTS || cents > MAX_PRICE_CENTS) {
    return undefined;
  }

  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}

function normalizeStringArray(value: unknown): string[] | undefined {
  const values = Array.isArray(value) ? value : [value];
  const normalized = [...new Set(values.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  ).map((item) => item.trim()))];
  return normalized.length > 0 ? normalized : undefined;
}

function normalizePage(value: unknown): number | undefined {
  const page = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(page) && page > 1 ? page : undefined;
}

export function parseCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const parsedMinPrice = normalizePrice(search.minPrice);
  const parsedMaxPrice = normalizePrice(search.maxPrice);
  const minPrice = parsedMinPrice ?? DEFAULT_MIN_PRICE;
  const maxPrice = parsedMaxPrice ?? DEFAULT_MAX_PRICE;
  const validPriceRange = BigInt(minPrice.replace(".", "")) <= BigInt(maxPrice.replace(".", ""));
  const q = typeof search.q === "string" ? search.q : "";

  return {
    ...(q.trim() ? { q } : {}),
    ...(normalizeStringArray(search.collection)
      ? { collection: normalizeStringArray(search.collection) }
      : {}),
    ...(normalizeStringArray(search.network)
      ? { network: normalizeStringArray(search.network) }
      : {}),
    ...(validPriceRange && parsedMinPrice ? { minPrice: parsedMinPrice } : {}),
    ...(validPriceRange && parsedMaxPrice ? { maxPrice: parsedMaxPrice } : {}),
    ...(search.tab === "new" || search.tab === "trending" ? { tab: search.tab } : {}),
    ...(search.sort === "price-low" || search.sort === "price-high"
      ? { sort: search.sort }
      : {}),
    ...(normalizePage(search.page) ? { page: normalizePage(search.page) } : {}),
  };
}
