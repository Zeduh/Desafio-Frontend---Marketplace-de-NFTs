import { Heart } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import type { Product } from "../../../features/catalog/types";
import { formatPrice } from "./formatPrice";

export function FeaturedNft({ product }: { product: Product }) {
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

interface ProductCardProps {
  product: Product;
  favorite: boolean;
  onFavoriteToggle: () => void;
}

export function ProductCard({
  product,
  favorite,
  onFavoriteToggle,
}: ProductCardProps) {
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
                <span>
                  {formatPrice(Number(product.price))} ETH
                </span>
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
