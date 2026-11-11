import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title" className="foundation-card">
      <p className="eyebrow">Página não encontrada</p>
      <h1 id="not-found-title">Este endereço ainda não existe</h1>
      <Link className="text-link" to="/">
        Voltar ao início
      </Link>
    </section>
  );
}
