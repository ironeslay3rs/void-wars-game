import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Downgrade two React 19 hygiene rules that arrived via the
    // April 2026 dep bump. They flag real tech debt (Date.now() in
    // render, setState in effects) across ~5 files. Keeping them as
    // `warn` so new code gets yellow squiggles without blocking CI.
    // Incremental cleanup tracked as branch debt.
    rules: {
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
