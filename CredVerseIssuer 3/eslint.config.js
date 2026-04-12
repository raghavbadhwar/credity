import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'migrations', 'drizzle', 'contracts']),
  {
    files: ['server/**/*.ts', 'shared/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended,
      {
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
          "@typescript-eslint/no-unused-vars": "off",
          "react-refresh/only-export-components": ["off"],
          "react-hooks/set-state-in-effect": "off",
          "react-hooks/purity": "off",
          "react-hooks/exhaustive-deps": "off",
          "react-hooks/rules-of-hooks": "off",
          "react-hooks/immutability": "off",
          "react-hooks/exhaustive-deps": "off",
          "react-hooks/rules-of-hooks": "off",
          "prefer-const": "off",
          "no-useless-escape": "off",
          "@typescript-eslint/no-unsafe-function-type": "off",
          "@typescript-eslint/no-namespace": "off"
        }
      }],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
  },
  {
    files: ['client/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      {
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
          "@typescript-eslint/no-unused-vars": "off",
          "react-refresh/only-export-components": ["off"],
          "react-hooks/set-state-in-effect": "off",
          "react-hooks/purity": "off",
          "react-hooks/exhaustive-deps": "off",
          "react-hooks/rules-of-hooks": "off",
          "react-hooks/immutability": "off",
          "react-hooks/exhaustive-deps": "off",
          "react-hooks/rules-of-hooks": "off",
          "prefer-const": "off",
          "no-useless-escape": "off",
          "@typescript-eslint/no-unsafe-function-type": "off",
          "@typescript-eslint/no-namespace": "off"
        }
      },
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      {
        rules: {
          "react-refresh/only-export-components": ["off"]
        }
      },
      {
        rules: {
          "react-refresh/only-export-components": ["off"],
          "react-hooks/set-state-in-effect": "off",
          "react-hooks/purity": "off",
          "react-hooks/exhaustive-deps": "off",
          "react-hooks/rules-of-hooks": "off",
          "react-hooks/immutability": "off"
        }
      },
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  prettier,
]);
