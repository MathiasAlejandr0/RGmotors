/**
 * Build estático para GitHub Pages.
 * Las API routes no son compatibles con output:export → se apartan temporalmente.
 */
import { rename, access, rm, cp } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const api = join(root, "app", "api");
const apiOff = join(root, "app", "_api_disabled");
const nextDir = join(root, ".next");

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function moveDir(src, dest) {
  try {
    await rename(src, dest);
  } catch {
    await cp(src, dest, { recursive: true });
    await rm(src, { recursive: true, force: true });
  }
}

async function main() {
  const hadApi = await exists(api);
  if (hadApi) {
    if (await exists(apiOff)) {
      await rm(apiOff, { recursive: true, force: true });
    }
    await moveDir(api, apiOff);
    console.log("→ API routes apartadas (app/_api_disabled)");
  }

  try {
    // Limpia caché de tipos de Next (referencia a /api/*)
    await rm(nextDir, { recursive: true, force: true });
    console.log("→ .next limpiado");

    const r = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["next", "build"],
      {
        cwd: root,
        stdio: "inherit",
        env: {
          ...process.env,
          GITHUB_PAGES: "true",
          NEXT_PUBLIC_BASE_PATH: "/RGmotors",
        },
        shell: process.platform === "win32",
      }
    );
    if (r.status !== 0) process.exit(r.status ?? 1);
    console.log("✓ Export estático listo en /out");
  } finally {
    if (hadApi && (await exists(apiOff))) {
      await moveDir(apiOff, api);
      console.log("→ API routes restauradas");
    }
  }
}


main().catch((e) => {
  console.error(e);
  process.exit(1);
});
