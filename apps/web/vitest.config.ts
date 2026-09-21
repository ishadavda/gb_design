import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // See the note in tests/stubs/server-only.ts.
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    // Unit tests live beside the code they cover. e2e/ is Playwright - it uses a
    // `test()` from a different package and fails loudly if Vitest collects it.
    include: ["{modules,shared,infra}/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      // Thresholds mirror TDD section 4.3. The pure-rules modules carry the
      // business-logic bar; everything else defaults to the app-wide floor.
      thresholds: {
        // Pure business rules carry the high bar - they have no excuse not to.
        "modules/**/rules.ts": { statements: 90, branches: 85, functions: 90, lines: 90 },
        // App-wide floor. Set just below where the suite actually sits so it
        // catches regressions rather than blocking every PR - a threshold nobody
        // can meet gets bypassed, which is worse than an honest low one.
        //
        // RATCHET: raise these as the service layer gets tested. The gap is
        // modules/auth/{service,session}, modules/accounts/service,
        // modules/consent/service and modules/onboarding/guard - all at 0%.
        // SonarCloud's Clean as You
        // Code gate (80% on new code) will push the number up once it is wired up;
        // this floor only stops it sliding back in the meantime.
        "**": { statements: 12, branches: 55, functions: 25, lines: 12 },
      },
      exclude: [
        "**/*.config.*",
        "**/.next/**",
        // Test setup and stubs, plus the specs themselves now that they sit
        // beside the code they cover.
        "**/tests/**",
        "**/*.test.{ts,tsx}",
        // Playwright specs - collected by `playwright test`, never by Vitest.
        "**/e2e/**",
        // Type declarations carry no runtime code to cover.
        "**/*.d.ts",
        // Generated PWA service worker - build output, not source.
        "**/public/**",
        // Presentation and wiring - covered by E2E, not unit tests.
        "**/app/**",
        "**/shared/ui/**",
        "**/middleware.ts",
        "**/modules/**/index.ts",
        "**/modules/**/types.ts",
      ],
    },
  },
});
