import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Package,
  RefreshCw,
  Search,
  Tags,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { api, getApiBase } from "@/lib/api";

function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = localStorage.getItem("authToken");
      const data = await api.get("/products", {
        requiresAuth: true,
        headers: { Authorization: `Basic ${btoa(auth)}` },
      });
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteProduct = async (product) => {
    const ok = window.confirm(
      `Delete product "${product.name}" (${product.code})? This cannot be undone.`
    );
    if (!ok) return;

    setDeletingProductId(product.id);
    setError("");

    try {
      const auth = localStorage.getItem("authToken");
      await api.delete(`/products/${product.id}`, {
        requiresAuth: true,
        headers: { Authorization: `Basic ${btoa(auth)}` },
      });
      await loadProducts();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDeleteAll = async () => {
    const ok = window.confirm(
      `Delete ALL ${products.length} products? This cannot be undone.`
    );
    if (!ok) return;

    setDeletingAll(true);
    setError("");

    try {
      const auth = localStorage.getItem("authToken");
      await api.delete("/products/all", {
        requiresAuth: true,
        headers: { Authorization: `Basic ${btoa(auth)}` },
      });
      await loadProducts();
    } catch (err) {
      setError(err.message || "Failed to delete all products");
    } finally {
      setDeletingAll(false);
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).filter(Boolean),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = filters.category
        ? product.category === filters.category
        : true;
      const matchesSearch = filters.search
        ? product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.code.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [filters, products]);

  return (
    <div className="p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500 text-lg mt-1">
                View all products added to the catalog
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDeleteAll}
              disabled={loading || deletingAll || products.length === 0}
              className="flex items-center gap-2 px-5 py-3 text-lg text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
              {deletingAll ? "Deleting..." : "Delete All"}
            </Button>
            <Button
              variant="outline"
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 text-lg"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Search size={20} />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or code"
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Tags size={20} />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {(filters.category || filters.search) && (
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => setFilters({ search: "", category: "" })}
                  className="w-full px-5 py-4 text-lg"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-2xl text-gray-500">
            Loading products...
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                      Image
                    </th>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                      Code
                    </th>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                      Name
                    </th>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                      Category
                    </th>
                    <th className="px-8 py-5 text-right text-lg font-bold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-16 text-center text-xl text-gray-500"
                      >
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-8 py-6">
                          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.image_path ? (
                              <img
                                src={`${getApiBase()}/images/${product.image_path}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon className="text-gray-400 w-8 h-8" />
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-lg text-gray-900 font-semibold">
                          {product.code}
                        </td>
                        <td className="px-8 py-6 text-lg text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex px-4 py-2 text-base font-medium bg-emerald-50 text-emerald-700 rounded-lg">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deletingProductId === product.id}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingProductId === product.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsDashboard;

