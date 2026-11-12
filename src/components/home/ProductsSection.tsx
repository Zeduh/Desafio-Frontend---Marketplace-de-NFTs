import { useCallback, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { fetchCatalog } from "../../features/catalog/api";
import type { CatalogSearch } from "../../features/catalog/types";
import { MobileFiltersDialog } from "./products/MobileFiltersDialog";
import { ProductFilters } from "./products/ProductFilters";
import { FeaturedNft } from "./products/ProductCard";
import { ProductsGrid } from "./products/ProductsGrid";
import { ProductsPagination } from "./products/ProductsPagination";
import { ProductsToolbar } from "./products/ProductsToolbar";
import "./ProductsSection.css";

const PRODUCTS_PER_PAGE = 9;

interface ProductsSectionProps {
  mobileFiltersOpen: boolean;
  onMobileFiltersOpenChange: (open: boolean) => void;
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
  const currentPage = request.page;

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
        updateSearch({
          collection: selectedCollections.includes(value)
            ? selectedCollections.filter((item) => item !== value)
            : [...selectedCollections, value],
          page: undefined,
        });
      }}
      onClearCollections={() => updateSearch({ collection: undefined, page: undefined })}
      networks={catalogQuery.data?.facets.networks ?? []}
      onNetworkToggle={(value) => {
        updateSearch({
          network: selectedNetworks.includes(value)
            ? selectedNetworks.filter((item) => item !== value)
            : [...selectedNetworks, value],
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
          <ProductsToolbar
            activeTab={request.tab}
            tabCounts={catalogQuery.data?.facets.tabs}
            onSortChange={(sort) =>
              updateSearch({ sort: sort === "recent" ? undefined : sort, page: undefined })
            }
            onTabChange={(tab) =>
              updateSearch({ tab: tab === "all" ? undefined : tab, page: undefined })
            }
            sortOrder={request.sort}
          />
          <ProductsGrid
            favoriteIds={favoriteIds}
            isError={catalogQuery.isError}
            isFetching={catalogQuery.isFetching}
            isPending={catalogQuery.isPending}
            onFavoriteToggle={toggleFavorite}
            onRetry={() => void catalogQuery.refetch()}
            products={catalogQuery.data?.items ?? []}
            skeletonCount={PRODUCTS_PER_PAGE}
            total={catalogQuery.data?.total}
          />
          {!catalogQuery.isPending &&
            !catalogQuery.isError &&
            (catalogQuery.data?.total ?? 0) > 0 && (
              <ProductsPagination
                currentPage={currentPage}
                onPageChange={(page) =>
                  updateSearch({ page: page === 1 ? undefined : page })
                }
                pageCount={pageCount}
              />
            )}
        </div>
      </div>

      <MobileFiltersDialog
        onOpenChange={onMobileFiltersOpenChange}
        open={mobileFiltersOpen}
      >
        {filters}
      </MobileFiltersDialog>
    </section>
  );
}
