import axios from "axios";

export const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
