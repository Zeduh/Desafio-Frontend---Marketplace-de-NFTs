import { Outlet } from "@tanstack/react-router";
import { SiteHeader } from "../components/layout/SiteHeader";
import { Button } from "../components/ui/button";

export function AppShell() {
  return (
    <div className="app-shell">
      <Button asChild className="skip-link" variant="link">
        <a href="#main-content">Pular para o conteúdo</a>
      </Button>
      <SiteHeader />
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
