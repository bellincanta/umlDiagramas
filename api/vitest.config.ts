import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/helpers/test-env.ts"],
    globalSetup: ["./tests/helpers/global-setup.ts"],
    // Os testes de integração compartilham um único SQLite de teste; rodar
    // arquivos de teste em sequência evita que o `resetDatabase()` de um
    // arquivo apague dados em uso por outro arquivo em paralelo.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: ["src/domain/**"],
      thresholds: {
        // Núcleo de negócio mais crítico (regras de relacionamento UML): exige 100%.
        "src/domain/relationship/**": {
          lines: 100,
          statements: 100,
          branches: 100,
          functions: 100,
        },
      },
    },
  },
});
