import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`landing e calculadora no navegador de ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cliente marcou, pagou o sinal, veio.");
    await expect(page.getByText("Pix de exemplo • não pague")).toBeVisible();
    await expect(page.getByText("Demonstração fictícia • sem automação WhatsApp")).toBeVisible();
    if (width > 640) await expect(page.getByText("• Exemplo fictício", { exact: true })).toBeVisible();
    const calculator = page.locator("#calculadora");
    for (const staff of [1, 3, 10]) {
      await calculator.locator('input[type="range"]').nth(0).fill(String(staff));
      for (const ticket of [40, 85, 250]) {
        await calculator.locator('input[type="range"]').nth(1).fill(String(ticket));
        for (const misses of [1, 4, 15]) {
          await calculator.locator('input[type="range"]').nth(2).fill(String(misses));
          const result = Math.round(misses * 4 * ticket * .4) - 119.90;
          const formatted = result.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
          await expect(calculator.getByText(`${result >= 0 ? "+ " : ""}${formatted} / mês`, { exact: true })).toBeVisible();
        }
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
    await page.getByRole("button", { name: "Login Salão", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
}

test("contato prepara o e-mail sem afirmar envio ou recebimento", async ({ page }) => {
  await page.goto("/contato");
  await page.getByPlaceholder("Ex: Ana Silva").fill("Cliente sintética");
  await page.getByPlaceholder("seu@email.com").fill("cliente@example.test");
  await page.getByPlaceholder("Escreva aqui detalhadamente como podemos te ajudar...").fill("Quero conhecer os planos.");
  await page.getByRole("button", { name: "Preparar mensagem", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mensagem preparada", exact: true })).toBeVisible();
  await expect(page.getByText(/Sua mensagem ainda não foi enviada/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir e-mail para enviar" })).toBeVisible();
  await expect(page.getByText("Mensagem Recebida!", { exact: true })).toHaveCount(0);
});

test("catálogo indisponível não oferece planos fictícios", async ({ page }) => {
  await page.route("**/api/public/plans", route => route.abort());
  await page.goto("/");
  await expect(page.locator("#planos").getByRole("alert")).toContainText("Não foi possível carregar os planos");
  await expect(page.locator("#planos").getByRole("button", { name: /^Testar / })).toHaveCount(0);
  await page.goto("/onboarding");
  await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
});

test("catálogo usa preço, limite e identificador retornados pela API", async ({ page }) => {
  await page.route("**/api/public/plans", route => route.fulfill({ json: [{ id: "plano-real", name: "Plano de teste", price: 149.90, maxProfessionals: 2 }] }));
  await page.goto("/");
  await expect(page.locator("#planos").getByText("R$ 149,90", { exact: true })).toBeVisible();
  await expect(page.locator("#planos").getByText("Até 2 profissional(is)", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Testar Plano de teste", exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding\?planId=plano-real$/);
});
