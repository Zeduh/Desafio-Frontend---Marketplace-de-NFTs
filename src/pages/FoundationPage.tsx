import { useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { api } from "../lib/api-client";

interface HealthResponse {
  status: "ok";
  mode: "mock";
}

export function FoundationPage() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>("/health");
      return data;
    },
    retry: false,
  });

  return (
    <section aria-labelledby="foundation-title" className="foundation-card">
      <p className="eyebrow">Fundação técnica</p>
      <h1 id="foundation-title">Base do marketplace configurada</h1>
      <p className="foundation-description">
        Esta tela é temporária. A primeira página de produto será construída a partir
        dos frames do Figma e das referências visuais.
      </p>
      <div aria-live="polite" className="api-status" role="status">
        {healthQuery.isPending ? (
          <>
            <LoaderCircle aria-hidden="true" className="status-icon is-loading" size={20} />
            <span>Verificando a API simulada…</span>
          </>
        ) : healthQuery.isError ? (
          <>
            <CircleX aria-hidden="true" className="status-icon is-error" size={20} />
            <span>
              Não foi possível verificar a API:{" "}
              {healthQuery.error instanceof Error
                ? healthQuery.error.message
                : "erro inesperado"}
            </span>
          </>
        ) : (
          <>
            <CircleCheck aria-hidden="true" className="status-icon is-success" size={20} />
            <span>API simulada ativa ({healthQuery.data.mode})</span>
          </>
        )}
      </div>
      <ul aria-label="Tecnologias configuradas" className="foundation-stack">
        <li>React + TypeScript</li>
        <li>TanStack Router + Query</li>
        <li>Axios + MSW</li>
        <li>Socket.IO + Tailwind CSS</li>
      </ul>
    </section>
  );
}
