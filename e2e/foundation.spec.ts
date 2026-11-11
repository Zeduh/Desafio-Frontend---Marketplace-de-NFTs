import { expect, test } from "@playwright/test";

test("home inicia e responde pela API simulada", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "SEJA DONO DO FUTURO DA ARTE DIGITAL",
      exact: true,
    }),
  ).toBeVisible();

  const healthResponse = await page.evaluate(async () => {
    const response = await fetch("/api/health");
    return {
      status: response.status,
      body: await response.json(),
    };
  });

  expect(healthResponse).toEqual({
    status: 200,
    body: { status: "ok", mode: "mock" },
  });
});
