import { Outlet } from "@tanstack/react-router";
import { SiteHeader } from "../components/layout/SiteHeader";
import { Button } from "../components/ui/button";

export function AppShell() {
  return (
    <div className="app-shell">
      <Button
        className="skip-link"
        nativeButton={false}
        render={<a href="#main-content" />}
        role="link"
        variant="link"
      >
        Pular para o conteúdo
      </Button>
      <SiteHeader />
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
