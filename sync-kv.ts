import { syncCatalogFromDriveFolders } from "./lib/server/driveSyncService.ts";

async function main() {
  const result = await syncCatalogFromDriveFolders([
    "https://drive.google.com/drive/folders/1zqX6z_sKWHjHyNoMlS_rtkkF6pK_FqVh?usp=sharing",
    "https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od?usp=sharing"
  ]);
  console.log(result);
}

main().catch(console.error);
