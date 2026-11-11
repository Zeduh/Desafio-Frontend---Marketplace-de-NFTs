import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "../lib/api-client";

export const handlers = [
  http.get(`${apiBaseUrl}/health`, () =>
    HttpResponse.json({
      status: "ok",
      mode: "mock",
    }),
  ),
];
