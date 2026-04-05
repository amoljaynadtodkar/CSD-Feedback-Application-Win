import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, MessageSquare, LogOut } from "lucide-react";

function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/customer", label: "Home", icon: Home },
    { path: "/customer/demand", label: "Request Product", icon: ShoppingBag },
    { path: "/customer/feedback", label: "Give Feedback", icon: MessageSquare },
  ];

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50">
      <aside className="w-80 bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer</h1>
              <p className="text-gray-500 text-base">Feedback Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6">
          <ul className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-5 px-6 py-6 rounded-2xl transition-all duration-200 touch-feedback ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/30 scale-105"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-700 hover:scale-102"
                    }`}
                    style={{ minHeight: '80px' }}
                  >
                    <div className="flex-shrink-0">
                      <Icon size={28} />
                    </div>
                    <span className="text-xl font-semibold">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleBackToLogin}
            className="w-full flex items-center gap-5 px-6 py-6 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 touch-feedback"
            style={{ minHeight: '80px' }}
          >
            <LogOut size={28} />
            <span className="text-xl font-semibold">Back to Login</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
