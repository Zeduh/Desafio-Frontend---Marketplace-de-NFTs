import { useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function useCatalogSearch() {
  const { q } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  const setQuery = useCallback((value: string) => {
    void navigate({
      resetScroll: false,
      replace: true,
      search: (previous) => ({
        ...previous,
        q: value.trim() ? value : undefined,
        page: undefined,
      }),
    });
  }, [navigate]);

  return {
    query: q ?? "",
    setQuery,
  };
}
