import { api } from "../../lib/api-client";
import type { CatalogRequest, CatalogResponse } from "./types";

export async function fetchCatalog(
  request: CatalogRequest,
  signal: AbortSignal,
): Promise<CatalogResponse> {
  const params = new URLSearchParams();
  if (request.q) {
    params.set("q", request.q);
  }
  for (const collection of [...request.collections].sort()) {
    params.append("collection", collection);
  }
  for (const network of [...request.networks].sort()) {
    params.append("network", network);
  }
  params.set("minPrice", request.minPrice);
  params.set("maxPrice", request.maxPrice);
  params.set("tab", request.tab);
  params.set("sort", request.sort);
  params.set("page", String(request.page));
  params.set("pageSize", String(request.pageSize));

  const response = await api.get<CatalogResponse>(`/nfts?${params.toString()}`, { signal });
  return response.data;
}
