import { Heart, House, Plus, ShoppingCart, UserRound } from "lucide-react";
import { Button } from "../ui/button";
import "./HomeMobileNavigation.css";

export function HomeMobileNavigation() {
  return (
    <nav aria-label="Navegação inferior" className="home-mobile-nav">
      <Button
        aria-current="page"
        aria-label="Início"
        className="home-mobile-nav__item home-mobile-nav__item--active"
        nativeButton={false}
        render={<a href="#top" />}
        role="link"
        size="icon"
        variant="ghost"
      >
        <House aria-hidden="true" size={18} />
      </Button>
      <Button
        aria-label="Favoritos"
        className="home-mobile-nav__item"
        disabled
        size="icon"
        title="Favoritos em breve"
        variant="ghost"
      >
        <Heart aria-hidden="true" fill="currentColor" size={18} />
      </Button>
      <Button
        aria-label="Criar NFT"
        className="home-mobile-nav__item home-mobile-nav__create"
        disabled
        size="icon"
        title="Criar NFT em breve"
        variant="default"
      >
        <Plus aria-hidden="true" size={22} />
      </Button>
      <Button
        aria-label="Carrinho"
        className="home-mobile-nav__item"
        disabled
        size="icon"
        title="Carrinho em breve"
        variant="ghost"
      >
        <ShoppingCart aria-hidden="true" size={18} />
      </Button>
      <Button
        aria-label="Perfil"
        className="home-mobile-nav__item"
        disabled
        size="icon"
        title="Perfil em breve"
        variant="ghost"
      >
        <UserRound aria-hidden="true" size={18} />
      </Button>
    </nav>
  );
}
