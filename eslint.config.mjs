import lichtblickPlugin from "@lichtblick/eslint-plugin";

export default [
  {
    ignores: ["dist/**", "*.js", "*.mjs", "website/**"],
  },

  ...lichtblickPlugin.configs.base,

  ...lichtblickPlugin.configs.typescript.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "linebreak-style": ["error", "unix"],
      // TypeScript validates named imports at compile time; the ESLint rule
      // produces false positives for packages with non-standard exports.
      "import/named": "off",
    },
  },

  ...lichtblickPlugin.configs.react,

  ...lichtblickPlugin.configs.jest.map((config) => ({
    ...config,
    files: ["**/*.spec.ts", "**/*.test.ts", "tests/**/*.ts"],
    rules: {
      ...config.rules,
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  })),
];
