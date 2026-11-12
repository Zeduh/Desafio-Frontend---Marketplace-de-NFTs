import { Search } from "lucide-react";
import { useCatalogSearch } from "../../features/catalog/useCatalogSearch";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

export function HeaderSearch() {
  const { query, setQuery } = useCatalogSearch();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label="Buscar NFTs"
            className="site-header-action"
            size="icon"
            type="button"
            variant="ghost"
          />
        }
      >
        <Search aria-hidden="true" size={20} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(20rem,calc(100vw-2rem))] border border-border bg-popover p-3 shadow-lg"
        side="bottom"
        sideOffset={8}
      >
        <Input
          aria-label="Buscar NFTs"
          autoFocus
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Buscar NFTs"
          type="search"
          value={query}
        />
      </PopoverContent>
    </Popover>
  );
}
