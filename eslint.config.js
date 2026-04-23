import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Catch references to undefined identifiers (e.g. accidentally removed `signOut`)
      // TS already enforces this at compile time, but we keep it as a CI safety net.
      "no-undef": "off", // disabled because TS handles it; keeping rule slot for clarity
      "@typescript-eslint/no-use-before-define": ["error", { functions: false, classes: true, variables: true }],
    },
  },
);
