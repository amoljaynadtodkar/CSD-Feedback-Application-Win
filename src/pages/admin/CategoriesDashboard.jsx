import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tags,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";

function CategoriesDashboard() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = localStorage.getItem("authToken");
      const data = await api.get("/categories", {
        requiresAuth: true,
        headers: { Authorization: `Basic ${btoa(auth)}` },
      });
      setCategories(data);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setAddingCategory(true);
    setError("");
    setSuccess("");

    try {
      const auth = localStorage.getItem("authToken");
      await api.post("/categories", 
        { name: newCategoryName.trim() },
        {
          requiresAuth: true,
          headers: { Authorization: `Basic ${btoa(auth)}` },
        }
      );
      
      setSuccess("Category added successfully!");
      setNewCategoryName("");
      setShowAddForm(false);
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const ok = window.confirm(
      `Delete category "${category.name}"? This cannot be undone.`
    );
    if (!ok) return;

    setDeletingCategoryId(category.id);
    setError("");
    setSuccess("");

    try {
      const auth = localStorage.getItem("authToken");
      await api.delete(`/categories/${category.id}`, {
        requiresAuth: true,
        headers: { Authorization: `Basic ${btoa(auth)}` },
      });
      
      setSuccess("Category deleted successfully!");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Tags size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-500 text-lg mt-1">
                Manage product categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-3 text-lg bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </Button>
            <Button
              variant="outline"
              onClick={loadCategories}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 text-lg"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-semibold text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400"
                  disabled={addingCategory}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={addingCategory}
                  className="px-6 py-3 text-lg bg-emerald-500 hover:bg-emerald-600"
                >
                  {addingCategory ? "Adding..." : "Add Category"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCategoryName("");
                    setError("");
                    setSuccess("");
                  }}
                  disabled={addingCategory}
                  className="px-6 py-3 text-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="px-6 py-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="px-6 py-4 rounded-2xl border border-green-200 bg-green-50 text-green-700 text-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-2xl text-gray-500">
            Loading categories...
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                      Category Name
                    </th>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                      Created Date
                    </th>
                    <th className="px-8 py-5 text-right text-lg font-bold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-8 py-16 text-center text-xl text-gray-500"
                      >
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition">
                        <td className="px-8 py-6">
                          <span className="inline-flex px-4 py-2 text-base font-medium bg-emerald-50 text-emerald-700 rounded-lg">
                            {category.name}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-lg text-gray-900">
                          {formatDate(category.created_at)}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteCategory(category)}
                              disabled={deletingCategoryId === category.id}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingCategoryId === category.id ? "Deleting..." : "Delete"}
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

export default CategoriesDashboard;
