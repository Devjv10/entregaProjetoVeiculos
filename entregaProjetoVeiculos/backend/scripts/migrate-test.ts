import "dotenv/config";
import { spawnSync } from "node:child_process";

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test")) {
  throw new Error(
    "Configure TEST_DATABASE_URL para um banco isolado cujo nome termine em _test.",
  );
}
const result = spawnSync("npm", ["run", "db:migrate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
