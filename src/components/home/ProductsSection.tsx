import { useCallback, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Heart, X } from "lucide-react";
import { fetchCatalog } from "../../features/catalog/api";
import type {
  CatalogFacet,
  CatalogSearch,
  Product,
  ProductTab,
} from "../../features/catalog/types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "../ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { Slider } from "../ui/slider";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import "./ProductsSection.css";

type PriceRange = { minimum: number; maximum: number };

const MIN_PRICE = 0.02;
const MAX_PRICE = 20;
const PRICE_STEP = 0.01;
const PRODUCTS_PER_PAGE = 9;

function formatPrice(price: number | null) {
  if (price === null) {
    return "—";
  }

  return price.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface ProductsSectionProps {
  mobileFiltersOpen: boolean;
  onMobileFiltersOpenChange: (open: boolean) => void;
}

interface ProductFiltersProps {
  collections: CatalogFacet[];
  selectedCollections: string[];
  onCollectionToggle: (collection: string) => void;
  onClearCollections: () => void;
  networks: CatalogFacet[];
  selectedNetworks: string[];
  onNetworkToggle: (network: string) => void;
  onClearNetworks: () => void;
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  onApplyPriceRange: () => void;
}

function PriceRangeSlider({
  priceRange,
  onPriceRangeChange,
}: Pick<ProductFiltersProps, "priceRange" | "onPriceRangeChange">) {
  return (
    <Slider
      className="products-filters__range"
      getAriaLabel={(index) => (index === 0 ? "Preço mínimo" : "Preço máximo")}
      getAriaValueText={(_formattedValue, value) => `${formatPrice(value)} ETH`}
      largeStep={1}
      max={MAX_PRICE}
      min={MIN_PRICE}
      minStepsBetweenValues={1}
      onThumbKeyDown={(event, index) => {
        if (event.key !== "Home" && event.key !== "End") {
          return;
        }

        event.preventDefault();
        const value = index === 0
          ? event.key === "Home"
            ? MIN_PRICE
            : priceRange.maximum - PRICE_STEP
          : event.key === "Home"
            ? priceRange.minimum + PRICE_STEP
            : MAX_PRICE;
        onPriceRangeChange(
          index === 0
            ? { ...priceRange, minimum: value }
            : { ...priceRange, maximum: value },
        );
      }}
      onValueChange={(values) => {
        const [minimum, maximum] = values;
        if (minimum !== undefined && maximum !== undefined) {
          onPriceRangeChange({
            minimum: Number(minimum.toFixed(2)),
            maximum: Number(maximum.toFixed(2)),
          });
        }
      }}
      step={PRICE_STEP}
      thumbCollisionBehavior="none"
      value={[priceRange.minimum, priceRange.maximum]}
    />
  );
}

function ProductFilters({
  collections,
  selectedCollections,
  onCollectionToggle,
  onClearCollections,
  networks,
  selectedNetworks,
  onNetworkToggle,
  onClearNetworks,
  priceRange,
  onPriceRangeChange,
  onApplyPriceRange,
}: ProductFiltersProps) {
  return (
    <div className="products-filters">
      <fieldset className="products-filters__group">
        <legend>Coleções</legend>
        <div className="products-filters__options">
          <button
            aria-pressed={selectedCollections.length === 0}
            className="products-filters__option products-filters__option--collection"
            onClick={onClearCollections}
            type="button"
          >
            <span>Todas as coleções</span>
            <span className="products-filters__count">
              ({collections.reduce((total, facet) => total + facet.count, 0)})
            </span>
          </button>
          {collections.map(({ value, count }) => (
            <button
              aria-pressed={selectedCollections.includes(value)}
              className="products-filters__option products-filters__option--collection"
              key={value}
              onClick={() => onCollectionToggle(value)}
              type="button"
            >
              <span>{value}</span>
              <span className="products-filters__count">({count})</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="products-filters__group products-filters__group--price">
        <legend>Faixa de preço</legend>
        <div className="products-filters__controls">
          <PriceRangeSlider onPriceRangeChange={onPriceRangeChange} priceRange={priceRange} />
          <output aria-atomic="true" aria-live="polite" className="products-filters__price">
            Preço: {formatPrice(priceRange.minimum)} - {formatPrice(priceRange.maximum)} ETH
          </output>
          <Button
            className="products-filters__apply"
            onClick={onApplyPriceRange}
            size="small"
            type="button"
          >
            Aplicar
          </Button>
        </div>
      </fieldset>

      <fieldset className="products-filters__group">
        <legend>Rede</legend>
        <div className="products-filters__options">
          <button
            aria-pressed={selectedNetworks.length === 0}
            className="products-filters__option products-filters__option--network"
            onClick={onClearNetworks}
            type="button"
          >
            <span>Todas as redes</span>
            <span className="products-filters__count">
              ({networks.reduce((total, facet) => total + facet.count, 0)})
            </span>
          </button>
          {networks.map(({ value, count }) => (
            <button
              aria-pressed={selectedNetworks.includes(value)}
              className="products-filters__option products-filters__option--network"
              key={value}
              onClick={() => onNetworkToggle(value)}
              type="button"
            >
              <span>{value}</span>
              <span className="products-filters__count">({count})</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function FeaturedNft({ product }: { product: Product }) {
  return (
    <section aria-labelledby="featured-nft-title" className="featured-nft">
      <div className="featured-nft__head">
        <h3 id="featured-nft-title">NFT EM DESTAQUE</h3>
        <p>OFERTA LIMITADA</p>
      </div>
      <img alt={product.name ?? "NFT em destaque"} src={product.artwork} />
    </section>
  );
}

function ProductCard({
  product,
  favorite,
  onFavoriteToggle,
}: {
  product: Product;
  favorite: boolean;
  onFavoriteToggle: () => void;
}) {
  const accessibleName = product.name ?? "NFT sem título informado";

  return (
    <li className="products-card">
      <article aria-label={accessibleName}>
        <div className="products-card__art">
          <img alt={`Arte de ${accessibleName}`} loading="lazy" src={product.artwork} />
          {product.id === "neon-vessel-552" && (
            <Badge className="products-card__badge rounded-none border-0">RARO</Badge>
          )}
          <Button
            aria-label={
              favorite
                ? `Remover ${accessibleName} dos favoritos`
                : `Adicionar ${accessibleName} aos favoritos`
            }
            aria-pressed={favorite}
            className="products-card__favorite"
            onClick={onFavoriteToggle}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} size={16} />
          </Button>
        </div>
        {product.name && (
          <div className="products-card__details">
            <p className="products-card__name">{product.name}</p>
            {product.price !== null && (
              <p className="products-card__price">
                <span>{formatPrice(Number(product.price))} ETH</span>
                {product.previousPrice && (
                  <span className="products-card__previous-price">
                    {formatPrice(Number(product.previousPrice))} ETH
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </article>
    </li>
  );
}

export function ProductsSection({
  mobileFiltersOpen,
  onMobileFiltersOpenChange,
}: ProductsSectionProps) {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const request = {
    q: search.q?.trim() ?? "",
    collections: search.collection ?? [],
    networks: search.network ?? [],
    minPrice: search.minPrice ?? "0.02",
    maxPrice: search.maxPrice ?? "12.30",
    tab: search.tab ?? "all",
    sort: search.sort ?? "recent",
    page: search.page ?? 1,
    pageSize: PRODUCTS_PER_PAGE,
  };
  const catalogQuery = useQuery({
    queryKey: ["catalog", request],
    queryFn: ({ signal }) => fetchCatalog(request, signal),
    placeholderData: keepPreviousData,
  });
  const activeTab = request.tab;
  const sortOrder = request.sort;
  const currentPage = request.page;
  const selectedCollections = request.collections;
  const selectedNetworks = request.networks;
  const rangeFromSearch = {
    minimum: Number(request.minPrice),
    maximum: Number(request.maxPrice),
  };
  const rangeSearchKey = `${request.minPrice}:${request.maxPrice}`;
  const [priceRangeState, setPriceRangeState] = useState({
    key: rangeSearchKey,
    value: rangeFromSearch,
  });
  const priceRange =
    priceRangeState.key === rangeSearchKey ? priceRangeState.value : rangeFromSearch;
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(["emerald-ape-042"]));

  const updateSearch = useCallback((update: Partial<CatalogSearch>, replace = false) => {
    void navigate({
      resetScroll: false,
      replace,
      search: (previous) => ({ ...previous, ...update }),
    });
  }, [navigate]);

  const pageCount = Math.ceil((catalogQuery.data?.total ?? 0) / PRODUCTS_PER_PAGE);
  const displayedPage = currentPage;
  const displayedProducts = catalogQuery.data?.items ?? [];

  useEffect(() => {
    if (!catalogQuery.data || currentPage <= Math.max(1, pageCount)) {
      return;
    }

    const lastPage = Math.max(1, pageCount);
    updateSearch({ page: lastPage === 1 ? undefined : lastPage }, true);
  }, [catalogQuery.data, currentPage, pageCount, updateSearch]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filters = (
    <ProductFilters
      collections={catalogQuery.data?.facets.collections ?? []}
      onApplyPriceRange={() => {
        const minimum = priceRange.minimum.toFixed(2);
        const maximum = priceRange.maximum.toFixed(2);
        updateSearch({
          minPrice: minimum === "0.02" ? undefined : minimum,
          maxPrice: maximum === "12.30" ? undefined : maximum,
          page: undefined,
        });
        onMobileFiltersOpenChange(false);
      }}
      onCollectionToggle={(value) => {
        const selected = search.collection ?? [];
        updateSearch({
          collection: selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value],
          page: undefined,
        });
      }}
      onClearCollections={() => updateSearch({ collection: undefined, page: undefined })}
      networks={catalogQuery.data?.facets.networks ?? []}
      onNetworkToggle={(value) => {
        const selected = search.network ?? [];
        updateSearch({
          network: selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value],
          page: undefined,
        });
      }}
      onClearNetworks={() => updateSearch({ network: undefined, page: undefined })}
      onPriceRangeChange={(value) => setPriceRangeState({ key: rangeSearchKey, value })}
      priceRange={priceRange}
      selectedCollections={selectedCollections}
      selectedNetworks={selectedNetworks}
    />
  );

  const tabs: { id: ProductTab; label: string }[] = [
    { id: "all", label: "Todos os NFTs" },
    { id: "new", label: "Novos lançamentos" },
    { id: "trending", label: "Em alta" },
  ];
  const sortLabels = {
    recent: "Listados recentemente",
    "price-low": "Menor preço",
    "price-high": "Maior preço",
  };

  return (
    <section aria-labelledby="products-title" className="products-section" id="products">
      <h2 className="products-section__title" id="products-title">
        Produtos
      </h2>
      <div className="products-layout">
        <aside aria-label="Filtros de produtos" className="products-sidebar">
          <div className="products-sidebar__panel">{filters}</div>
          {catalogQuery.data && <FeaturedNft product={catalogQuery.data.featured} />}
        </aside>

        <div className="products-main">
          <div className="products-toolbar">
            <Tabs
              className="products-tabs-root"
              onValueChange={(value) => {
                if (value === "all" || value === "new" || value === "trending") {
                  updateSearch({
                    tab: value === "all" ? undefined : value,
                    page: undefined,
                  });
                }
              }}
              value={activeTab}
            >
              <TabsList
                aria-label="Categorias de NFTs"
                className="products-tabs"
                variant="line"
              >
                {tabs.map(({ id, label }) => (
                  <TabsTrigger className="products-tab" key={id} value={id}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="products-toolbar__controls">
              <div className="products-sort">
                <span>Ordenar por:</span>
                <Select
                  onValueChange={(value) => {
                    if (value === "recent" || value === "price-low" || value === "price-high") {
                      updateSearch({ sort: value === "recent" ? undefined : value, page: undefined });
                    }
                  }}
                  value={sortOrder}
                >
                  <SelectTrigger aria-label="Ordenar por" className="products-sort__trigger">
                    <SelectValue>{sortLabels[sortOrder]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align="end" className="products-sort__content">
                    <SelectItem value="recent">Listados recentemente</SelectItem>
                    <SelectItem value="price-low">Menor preço</SelectItem>
                    <SelectItem value="price-high">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {catalogQuery.isPending && (
            <p className="sr-only" role="status">
              Carregando NFTs
            </p>
          )}
          <ul
            aria-busy={catalogQuery.isFetching}
            aria-label="NFTs"
            className="products-grid"
          >
            {catalogQuery.isPending &&
              Array.from({ length: PRODUCTS_PER_PAGE }, (_, index) => (
                <li aria-hidden="true" className="products-card products-card--skeleton" key={index}>
                  <Skeleton className="products-card__art products-skeleton" />
                  <div className="products-card__details">
                    <Skeleton className="products-skeleton products-skeleton__line" />
                    <Skeleton className="products-skeleton products-skeleton__line products-skeleton__line--short" />
                  </div>
                </li>
              ))}
            {displayedProducts.map((product) => (
              <ProductCard
                favorite={favoriteIds.has(product.id)}
                key={product.id}
                onFavoriteToggle={() => toggleFavorite(product.id)}
                product={product}
              />
            ))}
          </ul>

          {catalogQuery.isError && (
            <div className="products-empty" role="alert">
              <p>Não foi possível carregar os NFTs.</p>
              <Button onClick={() => void catalogQuery.refetch()} type="button" variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}
          {!catalogQuery.isPending && !catalogQuery.isError && catalogQuery.data?.total === 0 ? (
            <p className="products-empty" role="status">
              Nenhum NFT encontrado para os filtros selecionados.
            </p>
          ) : !catalogQuery.isError && (catalogQuery.data?.total ?? 0) > 0 ? (
            <Pagination
              aria-label="Paginação de produtos"
              className="products-pagination"
            >
              <PaginationContent className="products-pagination__list">
                {displayedPage > 1 && (
                  <PaginationItem>
                    <Button
                      aria-label="Página anterior"
                      className="products-pagination__previous"
                      onClick={() => updateSearch({ page: displayedPage === 2 ? undefined : displayedPage - 1 })}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <ArrowLeft aria-hidden="true" size={18} />
                    </Button>
                  </PaginationItem>
                )}
                {displayedPage === 1 && (
                  <PaginationItem
                    aria-hidden="true"
                    className="products-pagination__placeholder"
                  />
                )}
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                  <PaginationItem key={page}>
                    <Button
                      aria-current={page === displayedPage ? "page" : undefined}
                      aria-label={`Página ${page}`}
                      className={page === displayedPage ? "products-pagination__current" : ""}
                      onClick={() => updateSearch({ page: page === 1 ? undefined : page })}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                ))}
                {displayedPage < pageCount && (
                  <PaginationItem>
                    <Button
                      aria-label="Próxima página"
                      className="products-pagination__next"
                      onClick={() => updateSearch({ page: displayedPage + 1 })}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <ArrowRight aria-hidden="true" size={18} />
                    </Button>
                  </PaginationItem>
                )}
                {displayedPage === pageCount && (
                  <PaginationItem
                    aria-hidden="true"
                    className="products-pagination__placeholder"
                  />
                )}
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </div>

      <Dialog
        onOpenChange={onMobileFiltersOpenChange}
        open={mobileFiltersOpen}
      >
        <DialogContent
          className="products-dialog gap-0"
          overlayClassName="products-dialog-overlay"
          showCloseButton={false}
        >
          <DialogHeader className="products-dialog__heading gap-0">
            <DialogTitle>Filtros de produtos</DialogTitle>
            <DialogDescription>
              Refine os NFTs por coleção, faixa de preço ou rede.
            </DialogDescription>
            <DialogClose
              render={
                <Button
                  aria-label="Fechar filtros"
                  className="products-dialog__close"
                  size="icon"
                  type="button"
                  variant="ghost"
                />
              }
            >
              <X aria-hidden="true" size={18} />
            </DialogClose>
          </DialogHeader>
          {filters}
        </DialogContent>
      </Dialog>
    </section>
  );
}
