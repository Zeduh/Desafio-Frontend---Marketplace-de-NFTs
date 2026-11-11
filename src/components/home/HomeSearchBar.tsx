import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";

export function HomeSearchBar() {
  return (
    <div aria-label="Busca de NFTs" className="home-mobile-search" role="search">
      <div className="home-mobile-search__field">
        <Search aria-hidden="true" size={16} />
        <input
          aria-label="Explorar coleções"
          placeholder="Explorar coleções"
          type="search"
        />
      </div>
      <Button
        aria-label="Filtros"
        className="home-mobile-filter"
        disabled
        size="icon"
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={18} />
      </Button>
    </div>
  );
}
