import { Link } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";

export function SiteHeader() {
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
          <Button
            aria-label="Busca indisponível nesta etapa"
            className="site-header-action"
            disabled
            size="icon"
            type="button"
            variant="ghost"
          >
            <Search aria-hidden="true" size={20} />
          </Button>
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
