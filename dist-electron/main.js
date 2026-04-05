var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/os-utils/lib/osutils.js
var require_osutils = __commonJS({
  "node_modules/os-utils/lib/osutils.js"(exports2) {
    var _os = require("os");
    exports2.platform = function() {
      return process.platform;
    };
    exports2.cpuCount = function() {
      return _os.cpus().length;
    };
    exports2.sysUptime = function() {
      return _os.uptime();
    };
    exports2.processUptime = function() {
      return process.uptime();
    };
    exports2.freemem = function() {
      return _os.freemem() / (1024 * 1024);
    };
    exports2.totalmem = function() {
      return _os.totalmem() / (1024 * 1024);
    };
    exports2.freememPercentage = function() {
      return _os.freemem() / _os.totalmem();
    };
    exports2.freeCommand = function(callback) {
      require("child_process").exec("free -m", function(error, stdout, stderr) {
        var lines = stdout.split("\n");
        var str_mem_info = lines[1].replace(/[\s\n\r]+/g, " ");
        var mem_info = str_mem_info.split(" ");
        total_mem = parseFloat(mem_info[1]);
        free_mem = parseFloat(mem_info[3]);
        buffers_mem = parseFloat(mem_info[5]);
        cached_mem = parseFloat(mem_info[6]);
        used_mem = total_mem - (free_mem + buffers_mem + cached_mem);
        callback(used_mem - 2);
      });
    };
    exports2.harddrive = function(callback) {
      require("child_process").exec("df -k", function(error, stdout, stderr) {
        var total = 0;
        var used = 0;
        var free = 0;
        var lines = stdout.split("\n");
        var str_disk_info = lines[1].replace(/[\s\n\r]+/g, " ");
        var disk_info = str_disk_info.split(" ");
        total = Math.ceil(disk_info[1] * 1024 / Math.pow(1024, 2));
        used = Math.ceil(disk_info[2] * 1024 / Math.pow(1024, 2));
        free = Math.ceil(disk_info[3] * 1024 / Math.pow(1024, 2));
        callback(total, free, used);
      });
    };
    exports2.getProcesses = function(nProcess, callback) {
      if (typeof nProcess === "function") {
        callback = nProcess;
        nProcess = 0;
      }
      command = "ps -eo pcpu,pmem,time,args | sort -k 1 -r | head -n10";
      if (nProcess > 0)
        command = "ps -eo pcpu,pmem,time,args | sort -k 1 -r | head -n" + (nProcess + 1);
      require("child_process").exec(command, function(error, stdout, stderr) {
        var that = this;
        var lines = stdout.split("\n");
        lines.shift();
        lines.pop();
        var result = "";
        lines.forEach(function(_item, _i) {
          var _str = _item.replace(/[\s\n\r]+/g, " ");
          _str = _str.split(" ");
          result += _str[1] + " " + _str[2] + " " + _str[3] + " " + _str[4].substring(_str[4].length - 25) + "\n";
        });
        callback(result);
      });
    };
    exports2.allLoadavg = function() {
      var loads = _os.loadavg();
      return loads[0].toFixed(4) + "," + loads[1].toFixed(4) + "," + loads[2].toFixed(4);
    };
    exports2.loadavg = function(_time) {
      if (_time === void 0 || _time !== 5 && _time !== 15) _time = 1;
      var loads = _os.loadavg();
      var v = 0;
      if (_time == 1) v = loads[0];
      if (_time == 5) v = loads[1];
      if (_time == 15) v = loads[2];
      return v;
    };
    exports2.cpuFree = function(callback) {
      getCPUUsage2(callback, true);
    };
    exports2.cpuUsage = function(callback) {
      getCPUUsage2(callback, false);
    };
    function getCPUUsage2(callback, free) {
      var stats1 = getCPUInfo();
      var startIdle = stats1.idle;
      var startTotal = stats1.total;
      setTimeout(function() {
        var stats2 = getCPUInfo();
        var endIdle = stats2.idle;
        var endTotal = stats2.total;
        var idle = endIdle - startIdle;
        var total = endTotal - startTotal;
        var perc = idle / total;
        if (free === true)
          callback(perc);
        else
          callback(1 - perc);
      }, 1e3);
    }
    function getCPUInfo(callback) {
      var cpus = _os.cpus();
      var user = 0;
      var nice = 0;
      var sys = 0;
      var idle = 0;
      var irq = 0;
      var total = 0;
      for (var cpu in cpus) {
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
      }
      var total = user + nice + sys + idle + irq;
      return {
        "idle": idle,
        "total": total
      };
    }
  }
});

// src/electron/main.js
var import_electron4 = require("electron");
var import_child_process = require("child_process");
var import_path2 = require("path");

// src/electron/util.js
var import_electron2 = require("electron");

// src/electron/pathResolver.js
var import_path = __toESM(require("path"), 1);
var import_electron = require("electron");
function getPreloadPath() {
  return import_path.default.join(
    import_electron.app.getAppPath(),
    isDev() ? "./" : "../",
    "/dist-electron/preload.cjs"
  );
}
function getUIPath() {
  if (isDev()) {
    return import_path.default.join(import_electron.app.getAppPath(), "/dist-react/index.html");
  } else {
    return import_path.default.join(import_electron.app.getAppPath(), "dist-react", "index.html");
  }
}

// src/electron/util.js
var import_url = require("url");
function isDev() {
  return process.env.NODE_ENV === "development";
}
function ipcMainHandle(key, handler) {
  import_electron2.ipcMain.handle(key, (event) => {
    if (event.senderFrame) validateEventFrame(event.senderFrame);
    return handler();
  });
}
function ipcWebContentsSend(key, webContents, payload) {
  webContents.send(key, payload);
}
function validateEventFrame(frame) {
  if (isDev() && new URL(frame.url).host === "localhost:3524") return;
  if (frame.url !== (0, import_url.pathToFileURL)(getUIPath()).toString())
    throw new Error("Malicious event");
}

// src/electron/test.js
var import_os_utils = __toESM(require_osutils(), 1);
var import_fs = __toESM(require("fs"), 1);
var import_os = __toESM(require("os"), 1);
var import_electron3 = require("electron");
var POLLING_INTERVAL = 500;
function pollResources(mainWindow) {
  setInterval(async () => {
    const cpuUsage = await getCPUUsage();
    const storageData = getStorageData();
    const ramUsage = getRamUsage();
    ipcWebContentsSend("statistics", mainWindow.webContents, {
      cpuUsage,
      ramUsage,
      storageData: storageData.usage
    });
  }, POLLING_INTERVAL);
}
function getStaticData() {
  const totalStorage = getStorageData().total;
  const cpuModel = import_os.default.cpus()[0].model;
  const totalMemoryGB = Math.floor(import_os_utils.default.totalmem() / 1024);
  return {
    totalStorage,
    cpuModel,
    totalMemoryGB
  };
}
function getCPUUsage() {
  return new Promise((resolve) => {
    import_os_utils.default.cpuUsage(resolve);
  });
}
function getRamUsage() {
  return 1 - import_os_utils.default.freememPercentage();
}
function getStorageData() {
  const stats = import_fs.default.statfsSync(process.platform === "win32" ? "C://" : "/");
  const total = stats.bsize * stats.blocks;
  const free = stats.bsize * stats.bfree;
  return {
    total: Math.floor(total / 1e9),
    usage: 1 - free / total
  };
}

// src/electron/main.js
var fs2 = __toESM(require("fs"), 1);
var os2 = __toESM(require("os"), 1);
console.log("=== MAIN.JS LOADED ===");
console.log("isDev:", isDev());
console.log("resourcesPath:", process.resourcesPath);
var backendProcess = null;
function getLogStream() {
  if (!logStream) {
    const logPath = (0, import_path2.join)(os2.homedir(), "Library", "Application Support", "CSD Feedback Application", "app.log");
    fs2.mkdirSync((0, import_path2.dirname)(logPath), { recursive: true });
    logStream = fs2.createWriteStream(logPath, { flags: "a" });
  }
  return logStream;
}
function log(msg) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const logLine = `${timestamp} - ${msg}
`;
  console.log(msg);
  try {
    getLogStream().write(logLine);
  } catch (e) {
  }
}
function startBackend() {
  const cwd = process.cwd();
  let backendExecutable;
  if (isDev()) {
    backendExecutable = "python3";
    const args = ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"];
    backendProcess = (0, import_child_process.spawn)(backendExecutable, args, {
      cwd: (0, import_path2.join)(cwd, "backend"),
      shell: true,
      stdio: "inherit",
      env: { ...process.env, PYTHONPATH: (0, import_path2.join)(cwd, "backend") }
    });
  } else {
    const isWindows = process.platform === "win32";
    const executableName = isWindows ? "csd-feedback-server.exe" : "csd-feedback-server";
    backendExecutable = (0, import_path2.join)(process.resourcesPath, "backend", executableName);
    log("Starting backend executable: " + backendExecutable);
    log("Executable exists: " + fs2.existsSync(backendExecutable));
    log("Resources path: " + process.resourcesPath);
    backendProcess = (0, import_child_process.spawn)(backendExecutable, [], {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"]
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
    if (process.platform === "win32") {
      (0, import_child_process.spawn)("taskkill", ["/pid", backendProcess.pid, "/F", "/T"], {
        stdio: "ignore"
      });
    } else {
      backendProcess.kill("SIGTERM");
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          backendProcess.kill("SIGKILL");
        }
      }, 5e3);
    }
    backendProcess = null;
  }
}
import_electron4.app.on("ready", () => {
  startBackend();
  const mainWindow = new import_electron4.BrowserWindow({
    // Shouldn't add contextIsolate or nodeIntegration because of security vulnerabilities
    webPreferences: {
      preload: getPreloadPath()
    }
  });
  if (isDev()) mainWindow.loadURL("http://localhost:3524");
  else mainWindow.loadFile(getUIPath());
  pollResources(mainWindow);
  ipcMainHandle("getStaticData", () => {
    return getStaticData();
  });
});
import_electron4.app.on("before-quit", () => {
  stopBackend();
});
import_electron4.app.on("will-quit", (event) => {
  stopBackend();
});
