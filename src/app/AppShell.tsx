import { Link, Outlet } from "@tanstack/react-router";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link aria-label="NFT Marketplace, página inicial" className="site-brand" to="/">
          NFT Marketplace
        </Link>
        <span className="environment-label">Ambiente de desenvolvimento</span>
      </header>
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Desafio Frontend — Marketplace de NFTs</span>
        <span>Interface provisória para validação da fundação</span>
      </footer>
    </div>
  );
}
