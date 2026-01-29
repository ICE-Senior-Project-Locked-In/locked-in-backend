import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import fs from "node:fs";
import path from "node:path";
import globals from "globals";
import process from "node:process";

/**
 * Shared base config with JavaScript + TypeScript + Prettier defaults.
 * @type {import("eslint").Linter.FlatConfig[]}
 */
const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
];

const tsconfigPath = path.resolve(process.cwd(), "tsconfig.json");
const hasTsconfig = fs.existsSync(tsconfigPath);

const nodeConfig = {
  name: "repo/node",
  files: ["**/*.{ts,tsx,js,jsx}"],
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/build/**",
  ],
};

if (hasTsconfig) {
  nodeConfig.settings = {
    "import/resolver": {
      typescript: {
        project: tsconfigPath,
      },
    },
  };
}

/**
 * Flat config for Node/Express-style projects.
 * @type {import("eslint").Linter.FlatConfig[]}
 */
export const config = [...baseConfig, nodeConfig];

export default config;
