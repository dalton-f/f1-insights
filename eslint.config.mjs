import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: { globals: globals.browser },

    rules: {
      "no-duplicate-imports": ["error", { includeExports: true }],
      "no-inner-declarations": ["error", "both"],
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
      "no-useless-assignment": "error",
      "arrow-body-style": ["error", "as-needed"],
      camelcase: "error",
      "capitalized-comments": "warn",
      eqeqeq: ["error", "always"],
      "func-style": ["warn", "expression"],
      "func-name-matching": "error",
      "no-magic-numbers": [
        "warn",
        {
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],
      "no-nested-ternary": "error",
      "no-useless-return": "warn",
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "no-else-return": "error",
    },
  },
];
