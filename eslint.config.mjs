import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Farm content intentionally uses normal apostrophes and quotes in JSX
      // copy. Escaping editorial punctuation adds noise without a security gain.
      "react/no-unescaped-entities": "off",

      // Browser-local Farm OS state is intentionally hydrated after mount, and
      // responsive navigation intentionally closes when the route changes.
      // These effects synchronize React with browser-only state/UI boundaries.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
