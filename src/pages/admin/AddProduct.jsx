import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Package, Tag, ImagePlus } from "lucide-react";
import { api } from "@/lib/api";

function AddProduct() {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const auth = localStorage.getItem("authToken");
      const data = await api.get("/products/categories", {
        requiresAuth: true,
        headers: { Authorization: `Basic ${btoa(auth)}` },
      });
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Fallback to basic categories if API fails
      setCategories(["Electronics", "Clothing", "Food & Beverages", "Home & Garden", "Sports", "Books", "Toys", "Other"]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      if (
        !["image/jpeg", "image/jpg", "image/png"].includes(selectedFile.type)
      ) {
        setMessage("Only JPG and PNG files are allowed");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setMessage("");
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("code", formData.code);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      if (file) formDataToSend.append("file", file);

      const auth = localStorage.getItem("authToken");
      await api.postFile("/products", formDataToSend, auth);

      setMessage("Product added successfully!");
      setFormData({ code: "", name: "", category: "" });
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-5 mb-10 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-xl">
            <Package size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-500 text-lg mt-1">Fill in the product details below</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-8 px-8 py-6 rounded-[2rem] flex items-center gap-4 text-xl border-2 ${
              message.includes("success")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.includes("success") ? (
              <Check size={28} className="flex-shrink-0" />
            ) : (
              <X size={28} className="flex-shrink-0" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-[2rem] shadow-xl p-10 border-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
                <Tag size={24} className="text-emerald-500" />
                Product Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all active:scale-98"
                placeholder="e.g., PROD001"
                style={{ minHeight: '70px' }}
                required
              />
            </div>

            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all active:scale-98"
                placeholder="e.g., Wireless Mouse"
                style={{ minHeight: '70px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xl font-semibold text-gray-700 mb-4">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 bg-white transition-all active:scale-98"
              style={{ minHeight: '70px' }}
              required
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
              <ImagePlus size={24} className="text-emerald-500" />
              Product Image (Optional)
            </label>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group touch-feedback">
                  {preview ? (
                    <div className="relative w-full h-full p-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                          setPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute top-3 right-3 w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg active:scale-95"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-10 pb-8">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition">
                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-emerald-500" />
                      </div>
                      <p className="text-2xl text-gray-500 font-semibold">
                        Tap to upload
                      </p>
                      <p className="text-lg text-gray-400 mt-2">
                        JPG or PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                  />
                </label>
              </div>
              {file && (
                <div className="flex-1 w-full bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                  <p className="text-xl font-bold text-gray-700 mb-3">
                    Selected File:
                  </p>
                  <p className="text-lg text-gray-600 truncate">{file.name}</p>
                  <p className="text-gray-400 text-base mt-3">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-xl font-bold bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 shadow-lg shadow-emerald-300 active:scale-97 transition-all touch-feedback"
            style={{ minHeight: '75px' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-7 w-7" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding Product...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Package size={26} />
                Add Product
              </span>
            )}
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <button
            onClick={() => navigate("/admin/products/bulk")}
            className="py-6 px-8 text-xl font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-[2rem] shadow-lg shadow-purple-300 active:scale-97 transition-all touch-feedback"
            style={{ minHeight: '75px' }}
          >
            <span className="flex items-center justify-center gap-3">
              <Package size={26} />
              Bulk Add Products
            </span>
          </button>

          <button
            onClick={() => navigate("/admin/products/bulk-images")}
            className="py-6 px-8 text-xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white rounded-[2rem] shadow-lg shadow-orange-300 active:scale-97 transition-all touch-feedback"
            style={{ minHeight: '75px' }}
          >
            <span className="flex items-center justify-center gap-3">
              <ImagePlus size={26} />
              Bulk Add Images
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
