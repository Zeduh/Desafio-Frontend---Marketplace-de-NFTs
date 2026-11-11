import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { createAppRouter } from "./app/router";
import { worker } from "./mocks/browser";
import "./index.css";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
const router = createAppRouter(queryClient);

const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS?.trim().toLowerCase() !== "false";

async function bootstrap() {
  if (mocksEnabled) {
    await worker.start({
      onUnhandledRequest: "warn",
    });
  }

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error('Elemento raiz "#root" não encontrado.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap().catch((error: unknown) => {
  console.error("Falha ao iniciar a aplicação.", error);
});
