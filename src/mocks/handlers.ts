import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "../lib/api-client";
import { catalogHandler } from "./catalog-handler";

export const handlers = [
  http.get(`${apiBaseUrl}/health`, () =>
    HttpResponse.json({
      status: "ok",
      mode: "mock",
    }),
  ),
  catalogHandler,
];
