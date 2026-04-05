import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Package, MessageSquare, ThumbsUp, LogOut, Building2, Eye, BarChart3, Tags, Settings } from "lucide-react";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const menuItems = [
    { path: "/admin/products/view", label: "Products", icon: Eye },
    { path: "/admin/products", label: "Add Product", icon: Package },
    { path: "/admin/categories", label: "Categories", icon: Tags },
    { path: "/admin/demands", label: "Demands", icon: MessageSquare },
    { path: "/admin/feedback", label: "Feedback", icon: ThumbsUp },
    { path: "/admin/transactions", label: "Transaction Forensic Audit", icon: BarChart3 },
    { path: "/admin/settings", label: "Server Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <aside className="w-80 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 size={36} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin</h1>
              <p className="text-slate-400 text-base">Management Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 touch-feedback ${isActive
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/30 scale-105"
                      : "text-slate-300 hover:bg-white/10 hover:text-white hover:scale-102"
                      }`}
                  >
                    <div className="flex-shrink-0">
                      <Icon size={24} />
                    </div>
                    <span className="text-lg font-semibold text-left leading-tight">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 touch-feedback"
          >
            <LogOut size={24} />
            <span className="text-lg font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
