const { transformSync } = require("esbuild");

module.exports = {
  process(sourceText, sourcePath) {
    const result = transformSync(sourceText, {
      loader: sourcePath.endsWith(".jsx") ? "jsx" : "js",
      format: "esm",
      jsx: "automatic",
      target: "es2020",
    });

    return { code: result.code };
  },
};