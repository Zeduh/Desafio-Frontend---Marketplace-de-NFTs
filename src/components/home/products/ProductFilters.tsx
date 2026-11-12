import { Button } from "../../ui/button";
import { Slider } from "../../ui/slider";
import type { CatalogFacet } from "../../../features/catalog/types";
import { formatPrice } from "./formatPrice";

interface PriceRange {
  minimum: number;
  maximum: number;
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

const MIN_PRICE = 0.02;
const MAX_PRICE = 20;
const PRICE_STEP = 0.01;

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

export function ProductFilters({
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
          <Button
            aria-pressed={selectedCollections.length === 0}
            className="products-filters__option products-filters__option--collection"
            onClick={onClearCollections}
            type="button"
            variant="ghost"
          >
            <span>Todas as coleções</span>
            <span className="products-filters__count">
              ({collections.reduce((total, facet) => total + facet.count, 0)})
            </span>
          </Button>
          {collections.map(({ value, count }) => (
            <Button
              aria-pressed={selectedCollections.includes(value)}
              className="products-filters__option products-filters__option--collection"
              key={value}
              onClick={() => onCollectionToggle(value)}
              type="button"
              variant="ghost"
            >
              <span>{value}</span>
              <span className="products-filters__count">({count})</span>
            </Button>
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
          <Button
            aria-pressed={selectedNetworks.length === 0}
            className="products-filters__option products-filters__option--network"
            onClick={onClearNetworks}
            type="button"
            variant="ghost"
          >
            <span>Todas as redes</span>
            <span className="products-filters__count">
              ({networks.reduce((total, facet) => total + facet.count, 0)})
            </span>
          </Button>
          {networks.map(({ value, count }) => (
            <Button
              aria-pressed={selectedNetworks.includes(value)}
              className="products-filters__option products-filters__option--network"
              key={value}
              onClick={() => onNetworkToggle(value)}
              type="button"
              variant="ghost"
            >
              <span>{value}</span>
              <span className="products-filters__count">({count})</span>
            </Button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
