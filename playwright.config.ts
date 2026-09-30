import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * E2E, out/ klasorunu gercek bir statik sunucuyla sunar - `next start` degil.
 * output:'export' altinda `next start` calismiyor, ve 404 kapisi ancak gercek
 * bir statik sunucunun 404.html'i 404 koduyla dondurdugu yerde anlamli.
 * architecture.md §6, §8
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // CI'da dusen kosunun izi kalsin: html reporter playwright-report/ yazar ve
  // ci.yml onu yukler; dusen testin trace'i rapora kopyalanir. "on-first-retry"
  // retries 0 ile hic trace uretmiyordu. Yerelde reporter "list", trace yok.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: process.env.CI ? "retain-on-failure" : "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm exec serve out -l ${PORT} --no-clipboard`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
