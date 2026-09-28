import { TEST_DATABASE_URL } from "./test-db-url.js";

// Precisa ser importado (via vitest `setupFiles`) antes de qualquer import que
// alcance src/models/prisma/client.ts, que lê DATABASE_URL no carregamento do módulo.
process.env["DATABASE_URL"] = TEST_DATABASE_URL;
