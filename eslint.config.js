export default [
  {
      extends: [
        "plugin:security/recommended",
        "@antfu",
      ],
      files: ["**/*.{js, ts}"],
      rules: {
        "no-console": ["warn", { "allow": ["warn", "error", "info", "time", "timeEnd"] }],
        "curly": [0, "all"],
        "brace-style": [0, "stroustrup", { "allowSingleLine": false }],
        "@typescript-eslint/brace-style": [0, "stroustrup", { "allowSingleLine": false }],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],
        "arrow-parens": [2, "as-needed"]
      },
      "ignorePatterns": [
        "*/migrations/**",
        "*/build/**",
        "*/workflows/**",
        "docker-compose.yml"
      ]
  }
];
