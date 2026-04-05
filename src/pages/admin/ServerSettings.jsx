import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Server, Wifi, WifiOff, CheckCircle2, AlertCircle } from "lucide-react";
import { getApiBase } from "@/lib/api";

function ServerSettings() {
  const [serverMode, setServerMode] = useState("master");
  const [serverIp, setServerIp] = useState("");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // "ok" | "error" | null

  useEffect(() => {
    const mode = localStorage.getItem("serverMode") || "master";
    const ip = localStorage.getItem("serverIp") || "";
    setServerMode(mode);
    setServerIp(ip);
  }, []);

  const handleSave = () => {
    localStorage.setItem("serverMode", serverMode);
    if (serverMode === "client") {
      localStorage.setItem("serverIp", serverIp.trim());
    } else {
      localStorage.removeItem("serverIp");
    }

    // Notify Electron to update backend config if available
    if (window.electron?.saveServerConfig) {
      window.electron.saveServerConfig({
        mode: serverMode,
        ip: serverMode === "client" ? serverIp.trim() : "",
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    const base = serverMode === "client" && serverIp.trim()
      ? `http://${serverIp.trim()}:8000`
      : "http://localhost:8000";
    try {
      const res = await fetch(`${base}/products/categories/public`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        setConnectionStatus("ok");
      } else {
        setConnectionStatus("error");
      }
    } catch {
      setConnectionStatus("error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-4">
          <Server size={40} className="text-emerald-500" />
          Server Settings
        </h1>
        <p className="text-gray-500 text-lg mt-2">
          Configure how this instance connects to the backend server
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* Mode Selection */}
        <div>
          <label className="block text-xl font-semibold text-gray-700 mb-4">
            Instance Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setServerMode("master"); setConnectionStatus(null); }}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                serverMode === "master"
                  ? "border-emerald-500 bg-emerald-50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Server size={24} className={serverMode === "master" ? "text-emerald-600" : "text-gray-400"} />
                <span className="text-lg font-bold">Master (Server)</span>
              </div>
              <p className="text-sm text-gray-500">
                This machine runs the database. Other machines connect to it.
              </p>
            </button>

            <button
              onClick={() => { setServerMode("client"); setConnectionStatus(null); }}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                serverMode === "client"
                  ? "border-cyan-500 bg-cyan-50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Wifi size={24} className={serverMode === "client" ? "text-cyan-600" : "text-gray-400"} />
                <span className="text-lg font-bold">Client</span>
              </div>
              <p className="text-sm text-gray-500">
                Connect to a master machine&apos;s database over the network.
              </p>
            </button>
          </div>
        </div>

        {/* Server IP Input (only for client mode) */}
        {serverMode === "client" && (
          <div>
            <label className="block text-xl font-semibold text-gray-700 mb-4">
              Master Server IP Address
            </label>
            <input
              type="text"
              value={serverIp}
              onChange={(e) => { setServerIp(e.target.value); setConnectionStatus(null); }}
              placeholder="e.g. 192.168.1.100"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 transition-all"
            />
            <p className="text-sm text-gray-400 mt-2">
              Enter the IP address of the machine running in Master mode
            </p>
          </div>
        )}

        {/* Current connection info */}
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Currently connecting to:</p>
          <p className="text-lg font-mono font-semibold text-gray-700">
            {serverMode === "client" && serverIp.trim()
              ? `http://${serverIp.trim()}:8000`
              : "http://localhost:8000 (this machine)"}
          </p>
        </div>

        {/* Connection status */}
        {connectionStatus === "ok" && (
          <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-4 rounded-xl">
            <CheckCircle2 size={24} />
            <span className="text-lg font-semibold">Connection successful!</span>
          </div>
        )}
        {connectionStatus === "error" && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 px-5 py-4 rounded-xl">
            <AlertCircle size={24} />
            <span className="text-lg font-semibold">
              Cannot connect to server. Check IP address and ensure the master is running.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg"
          >
            {saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={20} /> Saved!
              </span>
            ) : (
              "Save Settings"
            )}
          </Button>

          <Button
            onClick={handleTestConnection}
            disabled={testing || (serverMode === "client" && !serverIp.trim())}
            variant="outline"
            className="px-8 py-4 text-lg font-semibold border-2"
          >
            {testing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Testing...
              </span>
            ) : (
              "Test Connection"
            )}
          </Button>
        </div>

        {saved && (
          <p className="text-amber-600 text-sm font-medium">
            Note: If you changed the mode, restart the application for the backend process change to take effect.
          </p>
        )}
      </div>
    </div>
  );
}

export default ServerSettings;
