import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

export function SiteHeader() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link aria-label="KURIO" className="site-brand" to="/">
          KURIO
        </Link>

        <nav aria-label="Navegação principal" className="site-nav">
          <Link aria-current="page" className="site-nav-link site-nav-link--active" to="/">
            Início
          </Link>
          <a className="site-nav-link" href="#products">
            Mercado
          </a>
          <span className="site-nav-link">Criadores</span>
          <span className="site-nav-link">Aprenda</span>
        </nav>

        <div className="site-header-actions">
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
                onChange={(event) => {
                  const q = event.currentTarget.value;
                  void navigate({
                    resetScroll: false,
                    replace: true,
                    search: (previous) => ({
                      ...previous,
                      q: q.trim() ? q : undefined,
                      page: undefined,
                    }),
                  });
                }}
                placeholder="Buscar NFTs"
                type="search"
                value={search.q ?? ""}
              />
            </PopoverContent>
          </Popover>
          <Button
            aria-label="Carrinho indisponível nesta etapa"
            className="site-header-action site-header-action--cart"
            disabled
            size="icon"
            type="button"
            variant="ghost"
          >
            <ShoppingCart aria-hidden="true" size={20} />
            <span aria-hidden="true" className="site-header-cart-count">
              0
            </span>
          </Button>
          <Button
            className="site-header-login"
            disabled
            type="button"
            variant="default"
          >
            <LogIn aria-hidden="true" size={20} />
            Entrar
          </Button>
        </div>
      </div>
    </header>
  );
}
