import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["eslint:recommended", "plugin:prettier/recommended"], languageOptions: { globals: globals.browser } },
  pluginReact.configs.flat.recommended,
]);
