module.exports = {
  env: {
    "es6": true,
    "jest": true,
    "browser": true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // "project": "./tsconfig.json", // uncomment to enable linting rules that relies on types. It takes 10x the time as of April 2019.
    sourceType: "module",
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true
    },
  },
  settings: {
    react: {
      version: "detect"
    },
    "import/ignore": [
      "node_modules",
    ],
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off"
      }
    },
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-undef": "off"
      }
    },
    {
      files: [
        "*.tests.js",
        "*-test.js"
      ],
      env: {
        "node": true,
        "jest": true
      },
      settings: {
        "import/resolver": {
          webpack: {
            config: "webpack.test.js",
            resolve: {
              extensions: [
                ".js",
                ".jsx",
              ]
            }
          }
        }
      }
    }
  ],
  plugins: [
    "@typescript-eslint",
    "prettier",
    "react",
    "import",
    "sort-class-members",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react",
    "plugin:import/typescript",
  ],
  /**
   * The following rules override any recommended ruleset in extends.
   * The goal is to remove these (same as setting them to ["error"]) */
  rules: {
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/explicit-member-accessibility": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/no-object-literal-type-assertion": ["error", {
      allowAsParameter: true // Allow type assertion in call and new expression, default false
    }],
    "@typescript-eslint/no-unused-vars": ["off"],
    "@typescript-eslint/no-use-before-define": ["off"],
    "@typescript-eslint/prefer-interface": ["off"],
    "@typescript-eslint/camelcase": [
      "off",
      {
        "allow": [
          "^UNSAFE_",
          "^LEGACY_",
          "^DANGEROUS_",
          "^DEPRECATED_"
        ]
      }
    ],
    "react/no-string-refs": ["error"],
    "react/no-deprecated": ["error"],
    "react/jsx-no-target-blank": ["error"],
    "react/no-unescaped-entities": ["off"],
    "react/prop-types": ["off"],
    "react/display-name": ["off"],
    "prettier/prettier": ["error"],
    "sort-class-members/sort-class-members": [
      "error",
      {
        "order": [
          "[static-properties]",
          "[static-methods]",
          "[properties]",
          "[conventional-private-properties]",
          "constructor",
          "[methods]",
          "[conventional-private-methods]"
        ],
        "accessorPairPositioning": "getThenSet"
      }
    ],
    "arrow-spacing": ["error"],
    "block-scoped-var": ["off"],
    "brace-style": ["error"],
    "camelcase": ["off"],
    "dot-notation": ["error"],
    "func-call-spacing": ["error"],
    "new-parens": ["error"],
    "no-array-constructor": ["error"],
    "no-console": ["off"],
    "no-constant-condition": ["error", { "checkLoops": false }],
    "no-irregular-whitespace": ["error", { "skipTemplates": true }],
    "no-label-var": ["error"],
    "no-lonely-if": ["error"],
    "no-new-object": ["error"],
    "no-param-reassign": ["off", { "props": false }],
    "no-redeclare": ["off"],
    "no-return-assign": ["error"],
    "no-self-compare": ["error"],
    "no-shadow-restricted-names": ["error"],
    "no-trailing-spaces": ["error"],
    "no-undef-init": ["error"],
    "no-unneeded-ternary": ["error"],
    "no-useless-call": ["error"],
    "no-useless-escape": ["off"],
    "no-void": ["error"],
    "radix": ["error"],
    "strict": ["error", "never"],
  },
  globals: {
    "__dirname": false,
    "$": false,
    "API_VERSION": false,
    "ARDOQ": true,
    "Backbone": false,
    "DOMParser": false,
    "Element": true,
    "FileReader": true,
    "FormData": false,
    "Handsontable": false,
    "Image": false,
    "Intercom": false,
    "LOG": false,
    "Promise": false,
    "Request": false,
    "URL": false,
    "alert": false,
    "analytics": true,
    "apiLog": false,
    "buster": false,
    "clearInterval": false,
    "clearTimeout": false,
    "confirm": false,
    "console": false,
    "crypto": false,
    "dagreD3": false,
    "define": false,
    "document": false,
    "error": false,
    "fail": false,
    "jQuery": false,
    "jasmine": false,
    "localStorage": false,
    "markdown": false,
    "module": false,
    "moment": false,
    "navigator": false,
    "nv": false,
    "prettyPrint": false,
    "process": false,
    "require": false,
    "setInterval": false,
    "setTimeout": false,
    "version": false,
    "window": false,
  },
}
