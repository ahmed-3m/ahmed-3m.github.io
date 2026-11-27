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
    // Tooling / generated / duplicated trees that should not be linted.
    ".agents/**",
    ".claude/**",
    "node_modules/**",
  ]),
  // Spec 008: the figure check and the retired figures stay out of the client bundle.
  // Every site module is covered (src/lib is reachable from the client too), and the
  // patterns catch relative paths and explicit extensions as well as the @/ alias.
  {
    files: ["src/**"],
    ignores: ["src/lib/claims/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/claims/check", "**/claims/check.*", "**/claims/retired", "**/claims/retired.*", "**/claims/read-figures", "**/claims/read-figures.*"],
              message: "Site code imports figures from @/lib/claims; the check and the retired figures are build-time only.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
