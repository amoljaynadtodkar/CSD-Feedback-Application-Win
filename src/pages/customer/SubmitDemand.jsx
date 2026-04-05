import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Tag, Lightbulb, Search, X, Image as ImageIcon, Calendar } from "lucide-react";
import { api, getApiBase } from "@/lib/api";

function SubmitDemand() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    product_name: "",
    product_code: "",
    new_description: "",
    quantity: "",
    required_by: "",
    name: "",
    contact_number: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await api.get("/products/categories/public", {
        requiresAuth: false,
      });
      // Extract category names if the API returns objects with 'name' field
      if (data && data.length > 0) {
        const categoryNames = data.map((cat) => 
          typeof cat === 'string' ? cat : cat.name
        );
        if (!categoryNames.includes("Other")) {
          categoryNames.push("Other");
        }
        setCategories(categoryNames);
      } else {
        setCategories(["Other"]);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Fallback to empty list if backend fails
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const getNextSixMonths = () => {
    const months = [];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      months.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }
    
    return months;
  };

  useEffect(() => {
    // Set default required_by to next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const defaultRequiredBy = `${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
    
    setFormData(prev => ({ ...prev, required_by: defaultRequiredBy }));
  }, []);

  useEffect(() => {
    if (formData.category) {
      loadProductsByCategory(formData.category);
    } else {
      setProducts([]);
      setFilteredProducts([]);
      setSelectedProduct(null);
      setProductSearch("");
    }
  }, [formData.category]);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.code.toLowerCase().includes(productSearch.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [productSearch, products]);


  const loadProductsByCategory = async (category) => {
    try {
      console.log("Loading products for category:", category);
      const data = await api.get("/products/public", {
        requiresAuth: false, // Use public endpoint
      });
      const categoryProducts = data.filter((p) => p.category === category);
      console.log("Filtered products:", categoryProducts);
      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
      setMessage("Unable to load products. Please describe the product you want below.");
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    setFormData({ ...formData, contact_number: limitedValue });
    
    // Set error if it doesn't match requirements
    if (limitedValue.length > 0 && limitedValue.length !== 10) {
      setContactError(`Contact number must be 10 digits (${limitedValue.length}/10)`);
    } else {
      setContactError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Validate contact number
    if (formData.contact_number.length !== 10) {
      setMessage("Please enter a valid 10-digit contact number");
      setLoading(false);
      return;
    }

    try {
      await api.post("/demands", {
        category: formData.category,
        product_name: formData.product_name || null,
        product_code: formData.product_code || null,
        new_description: formData.new_description || null,
        quantity: formData.quantity || null,
        required_by: formData.required_by || null,
        name: formData.name,
        contact_number: formData.contact_number,
      });

      setMessage("Demand submitted successfully!");
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const defaultRequiredBy = `${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
      
      setFormData({ category: "", product_name: "", product_code: "", new_description: "", quantity: "", required_by: defaultRequiredBy, name: "", contact_number: "" });
      setContactError("");
    } catch (err) {
      setMessage(err.message || "Failed to submit demand");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData({
      ...formData,
      product_name: product.name,
      product_code: product.code,
      new_description: "",
    });
    setShowProductDropdown(false);
    setProductSearch("");
  };

  const clearProductSelection = () => {
    setSelectedProduct(null);
    setFormData({
      ...formData,
      product_name: "",
      product_code: "",
    });
    setProductSearch("");
  };

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value,
      product_name: "",
      new_description: "",
      quantity: "",
    });
    setSelectedProduct(null);
    setProductSearch("");
    setContactError("");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCart size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request a Product</h1>
            <p className="text-gray-500 text-base mt-1">Tell us what products you'd like to see</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 px-6 py-4 rounded-xl flex items-center gap-3 text-lg border-2 ${
              message.includes("success")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.includes("success") && <Check size={20} className="flex-shrink-0" />}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-100"
        >
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Tag size={20} className="text-indigo-500" />
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white transition-all active:scale-98"
              style={{ minHeight: '60px' }}
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

          {formData.category && formData.category !== "Other" && (
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Select Existing Product
              </label>
              
              {selectedProduct ? (
                <div className="relative">
                  <div className="w-full px-4 py-3 text-lg border border-indigo-400 rounded-lg bg-indigo-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {selectedProduct.image_path ? (
                          <img
                            src={`${getApiBase()}/images/${selectedProduct.image_path}`}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="text-gray-400 w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{selectedProduct.name}</div>
                        <div className="text-xs text-gray-500">Code: {selectedProduct.code}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearProductSelection}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search
                      size={20}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      onFocus={() => setShowProductDropdown(true)}
                      placeholder="Search products by name or code..."
                      className="w-full pl-10 pr-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white transition-all"
                      style={{ minHeight: '60px' }}
                    />
                  </div>
                  
                  {showProductDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-center text-sm">
                          No products found
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleProductSelect(product)}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                <ImageIcon className="text-gray-400 w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                              <div className="text-xs text-gray-500">Code: {product.code}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <button
                type="button"
                onClick={() => {
                  clearProductSelection();
                  setShowProductDropdown(false);
                }}
                className="mt-2 text-indigo-600 hover:text-indigo-700 text-xs font-medium"
              >
                None of the above (request new product)
              </button>
            </div>
          )}

          {formData.category === "Other" && (
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Product Name & Description *
              </label>
              <textarea
                value={formData.new_description}
                onChange={(e) =>
                  setFormData({ ...formData, new_description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none active:scale-98"
                placeholder="Describe the product you're looking for..."
              />
            </div>
          )}

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-indigo-500 text-xl">👤</span>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white transition-all active:scale-98"
              style={{ minHeight: '60px' }}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-indigo-500 text-xl">📞</span>
              Contact Number *
            </label>
            <input
              type="text"
              value={formData.contact_number}
              onChange={handleContactNumberChange}
              className={`w-full px-4 py-3 text-lg border rounded-lg bg-white transition-all active:scale-98 ${
                contactError
                  ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                  : "border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              }`}
              style={{ minHeight: '60px' }}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              required
            />
            {contactError && (
              <p className="text-red-600 text-sm mt-2 font-medium">{contactError}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-500" />
              Quantity *
            </label>
            <div className="flex items-center gap-3">

              
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="flex-1 px-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white transition-all active:scale-98 text-center"
                style={{ minHeight: '60px', MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                placeholder="Enter quantity"
                required
              />


              <button
                type="button"
                onClick={() => {
                  const currentValue = parseInt(formData.quantity) || 0;
                  const newValue = currentValue + 1;
                  setFormData({ ...formData, quantity: newValue.toString() });
                }}
                className="w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md active:scale-95 transition-all touch-feedback"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </button>

                                          <button
                type="button"
                onClick={() => {
                  const currentValue = parseInt(formData.quantity) || 1;
                  const newValue = Math.max(1, currentValue - 1);
                  setFormData({ ...formData, quantity: newValue.toString() });
                }}
                className="w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md active:scale-95 transition-all touch-feedback"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-500" />
              Reqd By *
            </label>
            <select
              value={formData.required_by}
              onChange={(e) => setFormData({ ...formData, required_by: e.target.value })}
              className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white transition-all active:scale-98"
              style={{ minHeight: '60px' }}
              required
            >
              {getNextSixMonths().map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-md shadow-indigo-300 active:scale-97 transition-all touch-feedback"
            style={{ minHeight: '60px' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart size={20} />
                Submit Demand
              </span>
            )}
          </Button>
        </form>

        {formData.category !== "Other" && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 border border-blue-100 shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Lightbulb size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Pro Tip</h4>
                <p className="text-sm text-blue-700">
                  If you can't find your desired product in the list, select "Other", mention the Product Name and describe what you're looking for.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitDemand;
