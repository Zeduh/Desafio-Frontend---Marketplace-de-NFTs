import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import type { ProductTab, SortOrder } from "../../../features/catalog/types";

interface ProductsToolbarProps {
  activeTab: ProductTab;
  tabCounts?: Record<ProductTab, number>;
  sortOrder: SortOrder;
  onTabChange: (tab: ProductTab) => void;
  onSortChange: (sort: SortOrder) => void;
}

const tabs: { id: ProductTab; label: string }[] = [
  { id: "all", label: "Todos os NFTs" },
  { id: "new", label: "Novos lançamentos" },
  { id: "trending", label: "Em alta" },
];

const sortLabels: Record<SortOrder, string> = {
  recent: "Listados recentemente",
  "price-low": "Menor preço",
  "price-high": "Maior preço",
};

function isProductTab(value: string): value is ProductTab {
  return value === "all" || value === "new" || value === "trending";
}

function isSortOrder(value: string): value is SortOrder {
  return value === "recent" || value === "price-low" || value === "price-high";
}

export function ProductsToolbar({
  activeTab,
  tabCounts,
  sortOrder,
  onTabChange,
  onSortChange,
}: ProductsToolbarProps) {
  return (
    <div className="products-toolbar">
      <Tabs
        className="products-tabs-root"
        onValueChange={(value) => {
          if (isProductTab(value)) {
            onTabChange(value);
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
              <span>{label}</span>
              {tabCounts && (
                <span className="products-tab__count">({tabCounts[id]})</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="products-toolbar__controls">
        <div className="products-sort">
          <span>Ordenar por:</span>
          <Select
            onValueChange={(value) => {
              if (typeof value === "string" && isSortOrder(value)) {
                onSortChange(value);
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
  );
}
