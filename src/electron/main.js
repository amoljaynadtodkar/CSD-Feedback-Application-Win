import { app, BrowserWindow, ipcMain } from "electron";
import { spawn } from "child_process";
import { join, dirname } from "path";
import { ipcMainHandle, isDev } from "./util.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { getStaticData, pollResources } from "./test.js";
import * as fs from "fs";
import * as os from "os";

console.log("=== MAIN.JS LOADED ===");
console.log("isDev:", isDev());
console.log("resourcesPath:", process.resourcesPath);

let backendProcess = null;
let logStream = null;

function getLogStream() {
  if (!logStream) {
    const logPath = join(
      os.homedir(),
      "Library",
      "Application Support",
      "CSD Feedback Application",
      "app.log",
    );
    fs.mkdirSync(dirname(logPath), { recursive: true });
    logStream = fs.createWriteStream(logPath, { flags: "a" });
  }
  return logStream;
}

function log(msg) {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} - ${msg}\n`;
  console.log(msg);
  try {
    getLogStream().write(logLine);
  } catch (e) {
    // Ignore logging errors
  }
}

function getConfigPath() {
  const userDataPath = app.getPath("userData");
  return join(userDataPath, "server-config.json");
}

function readServerConfig() {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return data;
    }
  } catch (e) {
    log("Error reading server config: " + e.message);
  }
  return { mode: "master", ip: "" };
}

function saveServerConfig(config) {
  try {
    const configPath = getConfigPath();
    fs.mkdirSync(dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    log("Server config saved: " + JSON.stringify(config));
  } catch (e) {
    log("Error saving server config: " + e.message);
  }
}

function startBackend() {
  const cwd = process.cwd();
  let backendExecutable;

  if (isDev()) {
    // In development, use uv run with uvicorn
    backendExecutable = "uv";
    const args = [
      "run",
      "uvicorn",
      "app.main:app",
      "--host",
      "0.0.0.0",
      "--port",
      "8000",
    ];
    backendProcess = spawn(backendExecutable, args, {
      cwd: join(cwd, "backend"),
      shell: true,
      stdio: "inherit",
      env: { ...process.env },
    });
  } else {
    const isWindows = process.platform === "win32";
    const executableName = isWindows
      ? "csd-feedback-server.exe"
      : "csd-feedback-server";
    backendExecutable = join(process.resourcesPath, "backend", executableName);

    log("Starting backend executable: " + backendExecutable);
    log("Executable exists: " + fs.existsSync(backendExecutable));
    log("Resources path: " + process.resourcesPath);

    backendProcess = spawn(backendExecutable, [], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (backendProcess.stdout) {
      backendProcess.stdout.on("data", (data) => {
        log("[Backend stdout]: " + data.toString());
      });
    }
    if (backendProcess.stderr) {
      backendProcess.stderr.on("data", (data) => {
        log("[Backend stderr]: " + data.toString());
      });
    }
  }

  backendProcess.on("error", (error) => {
    log("Failed to start backend: " + error);
  });

  backendProcess.on("exit", (code) => {
    log("Backend process exited with code " + code);
  });
}

function stopBackend() {
  if (backendProcess) {
    // On Windows, kill the process tree; on Unix, just kill the process
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", backendProcess.pid, "/F", "/T"], {
        stdio: "ignore",
      });
    } else {
      backendProcess.kill("SIGTERM");
      // Force kill after 5 seconds if it doesn't exit gracefully
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          backendProcess.kill("SIGKILL");
        }
      }, 5000);
    }
    backendProcess = null;
  }
}

function waitForBackend(url, maxRetries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      log(`Waiting for backend (attempt ${attempts}/${maxRetries})...`);
      const http = require("http");
      const req = http.get(url, (res) => {
        log("Backend is ready! Status: " + res.statusCode);
        resolve();
      });
      req.on("error", () => {
        if (attempts >= maxRetries) {
          reject(
            new Error(
              "Backend failed to start after " + maxRetries + " attempts",
            ),
          );
        } else {
          setTimeout(check, interval);
        }
      });
      req.setTimeout(1000, () => {
        req.destroy();
        if (attempts >= maxRetries) {
          reject(
            new Error("Backend timed out after " + maxRetries + " attempts"),
          );
        } else {
          setTimeout(check, interval);
        }
      });
    };
    check();
  });
}

app.on("ready", async () => {
  const config = readServerConfig();
  log("Server config: " + JSON.stringify(config));

  // Only start local backend if this machine is the master
  if (config.mode !== "client") {
    startBackend();
  } else {
    log("Client mode — skipping local backend startup. Connecting to: " + config.ip);
  }

  // IPC handlers for server config
  ipcMain.handle("getServerConfig", () => readServerConfig());
  ipcMain.handle("saveServerConfig", (_event, newConfig) => {
    saveServerConfig(newConfig);
    return { success: true };
  });

  const mainWindow = new BrowserWindow({
    // Shouldn't add contextIsolate or nodeIntegration because of security vulnerabilities
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  // In production, wait for backend to be ready before loading the UI
  if (!isDev() && config.mode !== "client") {
    try {
      await waitForBackend("http://127.0.0.1:8000/categories");
    } catch (err) {
      log("Backend startup failed: " + err.message);
    }
  }

  const uiPath = getUIPath();
  console.log("Loading UI from:", uiPath);
  console.log("UI path exists:", require("fs").existsSync(uiPath));

  if (isDev()) {
    mainWindow.loadURL("http://localhost:3524");
  } else {
    mainWindow.loadFile(uiPath);
  }

  pollResources(mainWindow);

  ipcMainHandle("getStaticData", () => {
    return getStaticData();
  });
});

// Stop backend when app is about to quit
app.on("before-quit", () => {
  stopBackend();
});

// Also handle window close (in case before-quit doesn't fire)
app.on("will-quit", (event) => {
  stopBackend();
});
