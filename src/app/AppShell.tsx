import { Link, Outlet } from "@tanstack/react-router";
import { Button } from "../components/ui/button";

export function AppShell() {
  return (
    <div className="app-shell">
      <Button asChild className="skip-link" variant="link">
        <a href="#main-content">Pular para o conteúdo</a>
      </Button>
      <header className="site-header">
        <Link aria-label="NFT Marketplace, página inicial" className="site-brand" to="/">
          NFT Marketplace
        </Link>
      </header>
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Desafio Frontend — Marketplace de NFTs</span>
      </footer>
    </div>
  );
}
