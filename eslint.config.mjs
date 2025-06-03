import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/dist/"]),
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: await import("@typescript-eslint/parser"),
      globals: {
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",  
      }
    }
  }
]);
