import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
const path = process.env.BROWSER_FIXTURE_PATH || "/private/tmp/belezapura-browser-fixture.json";
const fixture = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : null;
test.skip(!fixture, "Prepare uma fixture sintética via TestPrepareBrowser.");
const apiUrl = process.env.E2E_API_URL || "http://127.0.0.1:3051";
async function login(page: Page, kind: "owner" | "other" | "admin" = "owner") {
 await page.goto(kind === "admin" ? "/login-admin" : "/login");
 await page.locator('input[type="email"]').fill(fixture[kind].email);
 await page.locator('input[type="password"]').fill(fixture[kind].password);
 await page.getByRole("button", { name: /Entrar/ }).click();
 await expect(page).toHaveURL(kind === "admin" ? /superadmin/ : /admin$/);
}
async function nav(page: Page, name: string) { await page.getByRole("button", { name, exact: true }).first().click(); }

test("estoque persiste após recarga e permanece isolado entre salões", async ({ page, browser }) => {
 const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
 await login(page); await nav(page, "Estoque");
 await page.getByRole("button", { name: "Adicionar Produto" }).click();
 const name = `Shampoo navegador ${Date.now()}`;
 await page.getByLabel("Nome do produto").fill(name); await page.getByLabel("Custo unitário").fill("29,90"); await page.getByLabel("Quantidade atual").fill("8");
 await page.locator("form").getByRole("button", { name: "Adicionar Produto", exact: true }).click();
 await expect(page.getByText(name, { exact: true })).toBeVisible();
 await page.reload(); await nav(page, "Estoque"); await expect(page.getByText(name, { exact: true })).toBeVisible();
 const context = await browser.newContext(); const other = await context.newPage(); await login(other, "other"); await nav(other, "Estoque"); await expect(other.getByText(name, { exact: true })).toHaveCount(0); await context.close(); expect(errors).toEqual([]);
});

test("horários e bloqueios são salvos e respeitados pela API", async ({ page, request }) => {
 await login(page); await nav(page, "Horários");
 await expect(page.getByRole("button", { name: "Salvar horários" })).toBeEnabled();
 const blocked = new Date(`${fixture.date}T12:00:00-03:00`); blocked.setDate(blocked.getDate() + 1);
 const date = `${blocked.getFullYear()}-${String(blocked.getMonth()+1).padStart(2,"0")}-${String(blocked.getDate()).padStart(2,"0")}`;
 await page.getByLabel("Data de bloqueio").fill(date); await page.getByRole("button", { name: "Adicionar data" }).click(); await page.getByRole("button", { name: "Salvar horários" }).click(); await expect(page.getByRole("status")).toHaveText("Horários salvos.");
 await page.reload(); await nav(page, "Horários"); await expect(page.getByText(date.split("-").reverse().join("/"), { exact: true })).toBeVisible();
 const response = await request.get(`${apiUrl}/api/public/availability?salonId=${fixture.owner.salonId}&professionalId=${fixture.professionalId}&serviceId=${fixture.serviceId}&date=${date}`); expect(response.ok()).toBeTruthy(); expect((await response.json()).available).toEqual([]);
});

test("reserva pública apresenta Pix pendente sem afirmar recebimento", async ({ page }) => {
 const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
 await page.goto(`/agendar/${fixture.owner.slug}`); await page.getByRole("button", { name: "Agendar", exact: true }).first().click();
 await page.getByRole("button", { name: `Escolher data ${fixture.date}` }).click(); await page.getByRole("button", { name: "10:00", exact: true }).click();
 await page.getByRole("button", { name: "Sim, confirmar e agendar" }).click();
 await page.getByPlaceholder("Ex: Amanda Silva").fill("Cliente navegador"); await page.getByPlaceholder("(11) 99999-9999").fill("11988887777");
 await page.getByRole("button", { name: /Gerar PIX do Sinal/ }).click();
 await expect(page.getByRole("button", { name: "Copiar Código PIX Copia e Cola" })).toBeVisible();
 await page.getByRole("button", { name: "Concluir e aguardar conferência do salão" }).click();
 await expect(page.getByRole("heading", { name: "Reserva registrada!" })).toBeVisible(); await expect(page.getByText(/aguardando conferência/)).toBeVisible(); await expect(page.getByText(/\(Pago\)/)).toHaveCount(0); expect(errors).toEqual([]);
});

test("assinatura solicita revisão e administrador confirma pagamento antes de liberar", async ({ page, browser, request }) => {
 await login(page); await page.getByRole("button", { name: "Assinar Plano", exact: true }).first().click();
 page.once("dialog", dialog => dialog.accept());
 const requested = page.waitForResponse(response => response.url() === `${apiUrl}/api/salon/upgrade-plan` && response.request().method() === "POST");
 await page.getByRole("button", { name: "Solicitar Studio", exact: true }).click();
 expect((await requested).status()).toBe(202);
 const before = await request.get(`${apiUrl}/api/salon/details`, { headers: { Authorization: `Bearer ${fixture.owner.token}` } }); const beforeData = await before.json(); expect(beforeData.subscriptions[0].status).toBe("TRIAL"); expect(beforeData.subscriptions[0].pendingPlanId).toBeTruthy();
 const context = await browser.newContext(); const admin = await context.newPage(); await login(admin, "admin"); await nav(admin, "Assinaturas");
 const row = admin.getByRole("row").filter({ has: admin.getByText(fixture.subscriptionId, { exact: true }) });
 // The salon name is shared by synthetic fixtures; identify its row by data attribute.
 const target = admin.locator(`[data-subscription-id="${fixture.subscriptionId}"]`);
 await target.getByRole("button", { name: "Conferir pagamento" }).click();
 await admin.getByLabel("Referência bancária do pagamento").fill(`browser-receipt-${Date.now()}`); await admin.getByRole("button", { name: "Confirmar recebimento e ativar" }).click();
 await expect(target.getByText("ACTIVE", { exact: true })).toBeVisible();
 const after = await request.get(`${apiUrl}/api/salon/details`, { headers: { Authorization: `Bearer ${fixture.owner.token}` } }); const afterData = await after.json(); expect(afterData.subscriptions[0].status).toBe("ACTIVE"); expect(afterData.subscriptions[0].currentPeriodEnd).toBeTruthy();
 admin.once("dialog", dialog => dialog.accept()); await target.getByRole("button", { name: "Bloquear", exact: true }).click(); await expect(target.getByText("BLOCKED", { exact: true })).toBeVisible();
 const blocked = await request.get(`${apiUrl}/api/public/salons/${fixture.owner.slug}`); expect(blocked.status()).toBe(402); await context.close();
});

test("painel móvel abre estoque e horários sem erro ou transbordamento", async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 }); const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
 await login(page, "other"); await page.getByRole("button", { name: "Abrir menu" }).click(); await nav(page, "Estoque"); await expect(page.getByRole("heading", { name: "Controle de Estoque" })).toBeVisible();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
 await page.getByRole("button", { name: "Abrir menu" }).click(); await nav(page, "Horários"); await expect(page.getByRole("button", { name: "Salvar horários" })).toBeEnabled(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy(); expect(errors).toEqual([]);
});
