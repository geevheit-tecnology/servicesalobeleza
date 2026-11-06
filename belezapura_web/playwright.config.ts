import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
 testDir: "./e2e", fullyParallel: false, workers: 1, retries: 0,
 timeout: 45000, expect: { timeout: 10000 },
 reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
 use: { baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5175", ...devices["Desktop Chrome"], screenshot: "only-on-failure", trace: "retain-on-failure" },
});
