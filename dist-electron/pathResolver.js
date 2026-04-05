import { isDev } from "./util.js";
import path from "path";
import { app } from "electron";

export function getPreloadPath() {
  if (isDev()) {
    return path.join(app.getAppPath(), "./dist-electron/preload.cjs");
  } else {
    // In production, the preload script is in the app.asar
    return path.join(app.getAppPath(), "dist-electron", "preload.cjs");
  }
}

export function getUIPath() {
  if (isDev()) {
    return path.join(app.getAppPath(), "/dist-react/index.html");
  } else {
    // In production, the dist-react folder is in the app.asar
    return path.join(app.getAppPath(), "dist-react", "index.html");
  }
}
