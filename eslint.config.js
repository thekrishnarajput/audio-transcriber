// eslint.config.js

const typescriptEslintParser = require("@typescript-eslint/parser");
const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  {
    ignores: [
      "node_modules",
      "dist",
      "public",
      "log-files",
      "./src/config/*.ts",
      "./src/migrations/*.ts",
      "./src/models/*.ts",
      "./src/index.ts",
    ],
    files: ["src/**/*.{ts,js}"],
    languageOptions: {
      parser: typescriptEslintParser,
      ecmaVersion: 2016,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      quotes: ["error", "double", { allowTemplateLiterals: true }],
    },
  },
];

