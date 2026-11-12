import { Search, SlidersHorizontal } from "lucide-react";
import { useCatalogSearch } from "../../features/catalog/useCatalogSearch";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface HomeSearchBarProps {
  onOpenFilters: () => void;
}

export function HomeSearchBar({ onOpenFilters }: HomeSearchBarProps) {
  const { query, setQuery } = useCatalogSearch();

  return (
    <div aria-label="Busca de NFTs" className="home-mobile-search" role="search">
      <div className="home-mobile-search__field">
        <Search aria-hidden="true" size={16} />
        <Input
          aria-label="Explorar coleções"
          className="home-mobile-search__input"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Explorar coleções"
          value={query}
          type="search"
        />
      </div>
      <Button
        aria-label="Filtros"
        className="home-mobile-filter"
        onClick={onOpenFilters}
        size="icon"
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={18} />
      </Button>
    </div>
  );
}
