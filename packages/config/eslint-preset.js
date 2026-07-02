// @ts-check
const prettier = require("eslint-config-prettier");

// Generic rules shared by every package in the monorepo. Framework-specific
// configs (e.g. eslint-config-next) are layered on top by the consuming
// package's own eslint.config.mjs, since only apps/web needs those.
/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  prettier,
  {
    rules: {
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
];
