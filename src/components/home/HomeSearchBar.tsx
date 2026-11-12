import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface HomeSearchBarProps {
  onOpenFilters: () => void;
}

export function HomeSearchBar({ onOpenFilters }: HomeSearchBarProps) {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  return (
    <div aria-label="Busca de NFTs" className="home-mobile-search" role="search">
      <div className="home-mobile-search__field">
        <Search aria-hidden="true" size={16} />
        <Input
          aria-label="Explorar coleções"
          className="home-mobile-search__input"
          onChange={(event) => {
            const q = event.currentTarget.value;
            void navigate({
              resetScroll: false,
              replace: true,
              search: (previous) => ({ ...previous, q: q || undefined, page: undefined }),
            });
          }}
          placeholder="Explorar coleções"
          value={search.q ?? ""}
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
