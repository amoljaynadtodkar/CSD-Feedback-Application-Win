import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import AdminLayout from "@/pages/admin/AdminLayout";
import AddProduct from "@/pages/admin/AddProduct";
import BulkAddProducts from "@/pages/admin/BulkAddProducts";
import BulkAddImages from "@/pages/admin/BulkAddImages";
import ProductsDashboard from "@/pages/admin/ProductsDashboard";
import CategoriesDashboard from "@/pages/admin/CategoriesDashboard";
import DemandsDashboard from "@/pages/admin/DemandsDashboard";
import FeedbackDashboard from "@/pages/admin/FeedbackDashboard";
import TransactionsAnalysis from "@/pages/admin/TransactionsAnalysis";
import ServerSettings from "@/pages/admin/ServerSettings";
import CustomerLayout from "@/pages/customer/CustomerLayout";
import CustomerHome from "@/pages/customer/CustomerHome";
import SubmitDemand from "@/pages/customer/SubmitDemand";
import SubmitFeedback from "@/pages/customer/SubmitFeedback";

function ProtectedAdminRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin");
  return isAdmin ? children : <Navigate to="/" />;
}

function App() {
  return (
    <HashRouter basename="/">
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/products/view" replace />} />
          <Route path="products" element={<AddProduct />} />
          <Route path="products/bulk" element={<BulkAddProducts />} />
          <Route path="products/bulk-images" element={<BulkAddImages />} />
          <Route path="products/view" element={<ProductsDashboard />} />
          <Route path="categories" element={<CategoriesDashboard />} />
          <Route path="demands" element={<DemandsDashboard />} />
          <Route path="feedback" element={<FeedbackDashboard />} />
          <Route path="transactions" element={<TransactionsAnalysis />} />
          <Route path="settings" element={<ServerSettings />} />
        </Route>

        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerHome />} />
          <Route path="demand" element={<SubmitDemand />} />
          <Route path="feedback" element={<SubmitFeedback />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
