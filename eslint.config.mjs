import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const CLAIMS_PATTERN = {
  group: ["**/claims/check", "**/claims/check.*", "**/claims/retired", "**/claims/retired.*", "**/claims/read-figures", "**/claims/read-figures.*"],
  message: "Site code imports figures from @/lib/claims; the check and the retired figures are build-time only.",
};
const PROMPT_RULES_PATTERN = {
  group: ["**/genie/prompt-rules", "**/genie/prompt-rules.*", "./prompt-rules", "./prompt-rules.*"],
  message: "Genie's rules are read only by src/lib/genie/prompt-file.ts; the site sends entry IDs and the Worker composes the prompt.",
};
const PROMPT_FILE_PATTERN = {
  group: ["**/genie/prompt-file", "**/genie/prompt-file.*", "./prompt-file", "./prompt-file.*"],
  message: "The prompt file is built only by the /genie/prompt.json route; client code must not bundle Genie's rules.",
};

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
  //
  // Spec 007 (FR-019, research R13): Genie's rules stay out of the client bundle too. Only
  // prompt-file.ts reads prompt-rules.ts, and only the prompt route reads prompt-file.ts;
  // the Worker composes the prompt. verify-export checks the built bundle as well.
  //
  // A later block replaces an earlier block's patterns for the same rule, so each block
  // lists every pattern that applies to its files.
  {
    files: ["src/**"],
    ignores: ["src/lib/claims/**"],
    rules: { "no-restricted-imports": ["error", { patterns: [CLAIMS_PATTERN, PROMPT_RULES_PATTERN, PROMPT_FILE_PATTERN] }] },
  },
  {
    files: ["src/lib/genie/prompt-file.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: [CLAIMS_PATTERN] }] },
  },
  {
    files: ["src/app/genie/prompt.json/route.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: [CLAIMS_PATTERN, PROMPT_RULES_PATTERN] }] },
  },
]);

export default eslintConfig;
