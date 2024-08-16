/**
 * ESLint
 * npm i eslint@9.3.0 --save-dev
 * 
 * Configurations
 * npm i @eslint/js@9.3.0 --save-dev
 */
import eslint from "@eslint/js";

/**
 * Globals
 * npm i globals@15.3.0 --save-dev
 */
import globals from "globals";

/**
 * Plugins
 * npm i @stylistic/eslint-plugin-js@2.1.0 --save-dev
 */
import pluginStylisticJs from "@stylistic/eslint-plugin-js";

import tseslint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    name: "core",
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2022
      }
    },
    rules: {
      "block-scoped-var": "error",
      "camelcase": ["error", {properties: "always"}],
      "capitalized-comments": "error",
      "consistent-return": "error",
      "curly": ["error", "all"],
      "default-case": "error",
      "eqeqeq": ["error", "always", {null: "ignore"}],
      "for-direction": "error",
      "id-length": ["error", {min: 3, properties: "never", exceptions: ["c", "i", "j", "k", "l", "x", "y", "z", "e", "ex", "fs", "os"]}],
      "max-depth": ["warn", 4],
      "no-array-constructor": "error",
      "no-bitwise": ["error"],
      "no-caller": "error",
      "no-console": "error",
      "no-delete-var": "error",
      "no-else-return": "error",
      "no-eval": "error",
      "no-iterator": "error",
      "no-lonely-if": "error",
      "no-magic-numbers": ["error", {ignore: [-1, 0, 1, 2, 1000], ignoreArrayIndexes: true}],
      "no-multi-assign": "error",
      "no-nested-ternary": "error",
      "no-object-constructor": "error",
      "no-undef": "warn",
      "no-unneeded-ternary": "error",
      "no-unused-vars": ["warn", {args: "after-used", caughtErrors: "none"}],
      "one-var": ["error", {initialized: "never", uninitialized: "always"}],
      "vars-on-top": "error"
    }
  },
  {
    name: "stylistic",
    plugins: {
      "@stylistic/js": pluginStylisticJs
    },
    rules: {
      "@stylistic/js/array-bracket-spacing": ["error", "never"],
      "@stylistic/js/array-bracket-newline": ["error", {multiline: true}],
      "@stylistic/js/array-element-newline": ["error", "consistent"],
      "@stylistic/js/brace-style": ["error", "1tbs"],
      "@stylistic/js/comma-dangle": ["error", "never"],
      "@stylistic/js/comma-spacing": ["error", {before: false, after: true}],
      "@stylistic/js/comma-style": ["error", "last"],
      "@stylistic/js/computed-property-spacing": ["error", "never"],
      "@stylistic/js/func-call-spacing": ["error", "never"],
      "@stylistic/js/function-paren-newline": ["error", "multiline"],
      "@stylistic/js/indent": ["error", 2, {SwitchCase: 1, MemberExpression: 1}],
      "@stylistic/js/key-spacing": ["error", {beforeColon: false, afterColon: true}],
      "@stylistic/js/keyword-spacing": ["error", {before: true, after: true}],
      "@stylistic/js/line-comment-position": ["error", {position: "above"}],
      "@stylistic/js/max-len": ["warn", {code: 160, tabWidth: 2, ignoreComments: true, ignoreUrls: true, ignoreRegExpLiterals: true}],
      "@stylistic/js/multiline-comment-style": ["warn", "starred-block"],
      "@stylistic/js/multiline-ternary": ["error", "never"],
      "@stylistic/js/new-parens": ["error"],
      // "@stylistic/js/newline-per-chained-call": ["error"],
      "@stylistic/js/no-mixed-operators": "error",
      "@stylistic/js/no-mixed-spaces-and-tabs": "error",
      "@stylistic/js/no-multiple-empty-lines": "error",
      "@stylistic/js/no-trailing-spaces": ["error", {ignoreComments: true, skipBlankLines: true}],
      "@stylistic/js/no-whitespace-before-property": "error",
      "@stylistic/js/object-curly-newline": ["error", {consistent: true}],
      // "@stylistic/js/object-curly-spacing": ["error", "never"],
      "@stylistic/js/object-property-newline": ["error", {allowAllPropertiesOnSameLine: true}],
      "@stylistic/js/operator-linebreak": ["error", "after"],
      "@stylistic/js/padded-blocks": ["error", "never"],
      "@stylistic/js/quotes": ["error", "double"],
      "@stylistic/js/semi": ["error", "always"],
      "@stylistic/js/semi-spacing": ["error", {before: false, after: true}],
      "@stylistic/js/semi-style": ["error", "last"],
      "@stylistic/js/space-in-parens": ["error", "never"],
      "@stylistic/js/space-before-blocks": "error",
      "@stylistic/js/space-before-function-paren": ["error", "never"],
      "@stylistic/js/space-infix-ops": "error",
      "@stylistic/js/space-unary-ops": ["error", {words: true, nonwords: false}],
      "@stylistic/js/spaced-comment": ["error", "always"],
      "@stylistic/js/wrap-regex": "error",
      "@stylistic/js/dot-location": ["error", "property"],
      "@stylistic/js/no-floating-decimal": "error",
      "@stylistic/js/wrap-iife": ["error", "inside"]
    }
  },
  {
    name: "ts",
    rules: {

    }
  },
  // ESLint config file ONLY!
  {
    name: "eslint-config",
    files: ["**/eslint.config.js", "**/eslint.config.mjs", "**/eslint.config.cjs"],
    rules: {
      "no-magic-numbers": 0,
      "@stylistic/js/multiline-comment-style": 0
    }
  }
];