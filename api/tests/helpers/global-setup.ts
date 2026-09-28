import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TEST_DATABASE_URL } from "./test-db-url.js";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const testDbPath = resolve(apiRoot, "test.db");

export default function setup(): () => void {
  execSync("npx prisma db push --accept-data-loss", {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });

  return () => {
    for (const suffix of ["", "-journal", "-wal", "-shm"]) {
      const file = `${testDbPath}${suffix}`;
      if (existsSync(file)) {
        unlinkSync(file);
      }
    }
  };
}
