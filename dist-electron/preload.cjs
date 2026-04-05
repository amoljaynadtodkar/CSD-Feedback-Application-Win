const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback) =>
    ipcOn("statistics", (stats) => {
      callback(stats);
    }),
  getStaticData: () => ipcInvoke("getStaticData"),
  getServerConfig: () => ipcInvoke("getServerConfig"),
  saveServerConfig: (config) =>
    electron.ipcRenderer.invoke("saveServerConfig", config),
});

function ipcInvoke(key) {
  return electron.ipcRenderer.invoke(key);
}

function ipcOn(key, callback) {
  const cb = (_, payload) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}
