import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import type { Product } from "../../../features/catalog/types";
import { ProductCard } from "./ProductCard";

interface ProductsGridProps {
  products: Product[];
  skeletonCount: number;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  total?: number;
  favoriteIds: Set<string>;
  onFavoriteToggle: (id: string) => void;
  onRetry: () => void;
}

export function ProductsGrid({
  products,
  skeletonCount,
  isPending,
  isFetching,
  isError,
  total,
  favoriteIds,
  onFavoriteToggle,
  onRetry,
}: ProductsGridProps) {
  return (
    <>
      {isPending && (
        <p className="sr-only" role="status">
          Carregando NFTs
        </p>
      )}
      <ul
        aria-busy={isFetching}
        aria-label="NFTs"
        className="products-grid"
      >
        {isPending &&
          Array.from({ length: skeletonCount }, (_, index) => (
            <li aria-hidden="true" className="products-card products-card--skeleton" key={index}>
              <Skeleton className="products-card__art products-skeleton" />
              <div className="products-card__details">
                <Skeleton className="products-skeleton products-skeleton__line" />
                <Skeleton className="products-skeleton products-skeleton__line products-skeleton__line--short" />
              </div>
            </li>
          ))}
        {products.map((product) => (
          <ProductCard
            favorite={favoriteIds.has(product.id)}
            key={product.id}
            onFavoriteToggle={() => onFavoriteToggle(product.id)}
            product={product}
          />
        ))}
      </ul>

      {isError && (
        <div className="products-empty" role="alert">
          <p>Não foi possível carregar os NFTs.</p>
          <Button onClick={onRetry} type="button" variant="outline">
            Tentar novamente
          </Button>
        </div>
      )}
      {!isPending && !isError && total === 0 && (
        <p className="products-empty" role="status">
          Nenhum NFT encontrado para os filtros selecionados.
        </p>
      )}
    </>
  );
}
