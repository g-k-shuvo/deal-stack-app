import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/**/*.test.ts",
        "src/lib/**/types.ts",
        "src/lib/**/index.ts",
        // Require a live Supabase to exercise — covered by integration tests, not unit.
        "src/lib/data/supabase.ts",
        "src/lib/data/supabase-repo.ts",
        "src/lib/auth/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 75,
        // PRD §19.3: 100% lines on engine, renderers, security utils.
        // (Branch gate < 100 where ajv/SDK type-guard fallbacks are practically unreachable.)
        "src/lib/engine/**/*.ts": { lines: 100, functions: 100, statements: 100, branches: 85 },
        "src/lib/render/**/*.ts": { lines: 100, functions: 100, statements: 100, branches: 85 },
        "src/lib/crypto.ts": { lines: 100, functions: 100, statements: 100, branches: 90 },
      },
    },
  },
});
