// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

export default [
    {
        ignores: ["node_modules", "dist", "build", "coverage"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        rules: {
            "prettier/prettier": [
                "error",
                {
                    semi: true,
                    singleQuote: false,
                    tabWidth: 4,
                    trailingComma: "es5",
                    printWidth: 100,
                    arrowParens: "always",
                    endOfLine: "lf",
                },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },
];
