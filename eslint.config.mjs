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
  {
    files: ["src/components/**", "src/app/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["@/lib/claims/check", "@/lib/claims/retired", "@/lib/claims/read-figures"].map((name) => ({
            name,
            message: "Components import figures from @/lib/claims; the check and the retired figures are build-time only.",
          })),
        },
      ],
    },
  },
]);

export default eslintConfig;
