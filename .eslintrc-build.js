module.exports = {
  extends: [
    ".eslintrc.js",
    "plugin:import/errors",
    "plugin:import/typescript"
  ],
  settings: {
    "import/resolver": {
      webpack: {
        resolve: {
          config: "./webpack.prod.js",
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx"
          ]
        }
      }
    }
  },
  rules: {
    "import/no-cycle": ["error"]
  }
}
