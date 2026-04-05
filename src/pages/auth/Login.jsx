import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, User, Lock, ArrowRight, Smartphone, Settings, Server, Wifi } from "lucide-react";
import mcteLogo from "../../ui/assets/mcte.png";
import { api, getApiBase } from "@/lib/api";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverMode, setServerMode] = useState("master");
  const [serverIp, setServerIp] = useState("");
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    setServerMode(localStorage.getItem("serverMode") || "master");
    setServerIp(localStorage.getItem("serverIp") || "");
  }, []);

  const handleSaveServerConfig = () => {
    localStorage.setItem("serverMode", serverMode);
    if (serverMode === "client") {
      localStorage.setItem("serverIp", serverIp.trim());
    } else {
      localStorage.removeItem("serverIp");
    }
    if (window.electron?.saveServerConfig) {
      window.electron.saveServerConfig({
        mode: serverMode,
        ip: serverMode === "client" ? serverIp.trim() : "",
      });
    }
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.post("/login", { username, password });
      
      if (result.success) {
        localStorage.setItem("authToken", `${username}:${password}`);
        localStorage.setItem("isAdmin", "true");
        navigate("/admin");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerMode = () => {
    navigate("/customer");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 p-6 overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl p-10">
          <div className="text-center mb-10">
            <div className="w-28 h-28  rounded-3xl mx-auto mb-6 flex items-center justify-center ">
              <img src={mcteLogo} alt="MCTE Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">URC Feedback Portal</h1>
            <p className="text-gray-500 text-lg">Welcome back! Please sign in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-5 rounded-2xl text-center text-lg animate-slide-up">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
                <User size={24} className="text-emerald-500" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all active:scale-98"
                placeholder="Enter username"
                style={{ minHeight: '70px' }}
                required
              />
            </div>

            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
                <Lock size={24} className="text-emerald-500" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all active:scale-98"
                placeholder="Enter password"
                style={{ minHeight: '70px' }}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-300 active:scale-97 transition-all touch-feedback"
              style={{ minHeight: '75px' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-7 w-7" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Sign In
                  <ArrowRight size={24} />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-gray-400 text-lg font-medium">or</span>
            </div>
          </div>

          <Button
            onClick={handleCustomerMode}
            className="w-full py-6 text-xl font-bold bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-lg active:scale-97 transition-all touch-feedback"
            style={{ minHeight: '75px' }}
          >
            <Smartphone size={28} className="mr-3" />
            Customer Mode
          </Button>

          {/* Server Configuration Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mx-auto transition-colors"
            >
              <Settings size={16} />
              Server Connection
              {serverMode === "client" && serverIp && (
                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                  {serverIp}
                </span>
              )}
            </button>

            {showServerConfig && (
              <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setServerMode("master")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                      serverMode === "master"
                        ? "bg-emerald-500 text-white shadow"
                        : "bg-white border border-gray-200 text-gray-600"
                    }`}
                  >
                    <Server size={16} /> Master
                  </button>
                  <button
                    onClick={() => setServerMode("client")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                      serverMode === "client"
                        ? "bg-cyan-500 text-white shadow"
                        : "bg-white border border-gray-200 text-gray-600"
                    }`}
                  >
                    <Wifi size={16} /> Client
                  </button>
                </div>

                {serverMode === "client" && (
                  <input
                    type="text"
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    placeholder="Master IP (e.g. 192.168.1.100)"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
                  />
                )}

                <Button
                  onClick={handleSaveServerConfig}
                  className="w-full py-3 text-sm font-semibold bg-gray-800 hover:bg-gray-900"
                >
                  {configSaved ? "Saved!" : "Save Connection"}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  {serverMode === "master"
                    ? "This machine will run its own server"
                    : serverIp
                      ? `Connecting to ${serverIp}:8000`
                      : "Enter the master server IP address"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
