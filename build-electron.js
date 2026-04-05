import { build } from "esbuild";
import { copyFileSync } from "fs";
import { join } from "path";

const nodeEnv = process.env.NODE_ENV || "production";
const isDev = nodeEnv === "development";

async function buildElectron() {
  try {
    // Build main.js to CommonJS
    await build({
      entryPoints: ["src/electron/main.js"],
      bundle: true,
      platform: "node",
      format: "cjs",
      outfile: "dist-electron/main.cjs",
      external: ["electron"],
      sourcemap: isDev,
      define: {
        "process.env.NODE_ENV": `"${nodeEnv}"`,
      },
    });

    // Copy other files that don't need bundling
    const filesToCopy = [
      "src/electron/preload.cjs",
      "src/electron/pathResolver.js",
      "src/electron/util.js",
      "src/electron/test.js",
    ];

    filesToCopy.forEach((file) => {
      const dest = file.replace("src/electron/", "dist-electron/");
      copyFileSync(file, dest);
    });

    console.log("Electron build completed successfully");
  } catch (error) {
    console.error("Electron build failed:", error);
    process.exit(1);
  }
}

buildElectron();
