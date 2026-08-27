import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 flat config'i dogrudan veriyor; @eslint/eslintrc
 * uzerinden FlatCompat koprusu gerekmiyor.
 *
 * Buradaki asil deger Next'in kendi kurallari: next/image kullanimi, hooks,
 * link davranisi. architecture.md §6
 */
const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default config;
