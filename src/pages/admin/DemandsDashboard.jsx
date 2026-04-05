import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Filter, MessageSquare, Search, Calendar, ChevronDown, ChevronUp, User, Phone, Download, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import * as XLSX from "xlsx";

function DemandsDashboard() {
  const [demands, setDemands] = useState([]);
  const [filteredDemands, setFilteredDemands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDemandId, setExpandedDemandId] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    requiredBy: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = demands;
    
    if (filters.category) {
      filtered = filtered.filter((d) => d.category === filters.category);
    }
    if (filters.requiredBy) {
      filtered = filtered.filter((d) => d.required_by === filters.requiredBy);
    }
    
    setFilteredDemands(filtered);
  }, [filters, demands]);

  const loadData = async () => {
    try {
      const auth = localStorage.getItem("authToken");
      const [demandsData, categoriesData] = await Promise.all([
        api.get("/demands", { requiresAuth: true, headers: { Authorization: `Basic ${btoa(auth)}` } }),
        api.get("/products/categories", { requiresAuth: true, headers: { Authorization: `Basic ${btoa(auth)}` } }),
      ]);
      setDemands(demandsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load demands:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const auth = localStorage.getItem("authToken");
      await api.put(
        `/demands/${id}`,
        { status: newStatus },
        { requiresAuth: true, headers: { Authorization: `Basic ${btoa(auth)}` } }
      );
      setDemands(
        demands.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const clearFilters = () => {
    setFilters({ category: "", requiredBy: "" });
  };

  const handleDeleteDemand = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this demand? This cannot be undone.")) return;
    try {
      const auth = localStorage.getItem("authToken");
      await api.delete(`/demands/${id}`, { requiresAuth: true, headers: { Authorization: `Basic ${btoa(auth)}` } });
      setDemands(demands.filter((d) => d.id !== id));
      if (expandedDemandId === id) setExpandedDemandId(null);
    } catch (err) {
      console.error("Failed to delete demand:", err);
    }
  };

  const exportToExcel = () => {
    const rows = filteredDemands.map((d) => ({
      "ID": d.id,
      "Category": d.category,
      "Product Code": d.product_code || "-",
      "Product Name": d.product_name || "-",
      "New Description": d.new_description || "-",
      "Quantity": d.quantity ?? "-",
      "Required By": d.required_by || "-",
      "Customer Name": d.name || "-",
      "Contact Number": d.contact_number || "-",
      "Status": d.status,
      "Submitted On": d.timestamp,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Demands");

    const filterSuffix = [
      filters.category && `Cat-${filters.category}`,
      filters.requiredBy && `Month-${filters.requiredBy}`,
    ]
      .filter(Boolean)
      .join("_");

    const filename = `Demands${filterSuffix ? `_${filterSuffix}` : ""}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const getUniqueRequiredByMonths = () => {
    const months = [...new Set(demands.map(d => d.required_by).filter(Boolean))];
    return months.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-2xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-5 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Customer Demands</h1>
              <p className="text-gray-500 text-lg mt-1">View and manage product requests</p>
            </div>
          </div>
          <Button
            onClick={exportToExcel}
            disabled={filteredDemands.length === 0}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px' }}
          >
            <Download size={20} />
            Export to Excel
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Filter size={24} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 bg-white"
                style={{ minHeight: '60px' }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Reqd By
              </label>
              <select
                value={filters.requiredBy}
                onChange={(e) =>
                  setFilters({ ...filters, requiredBy: e.target.value })
                }
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 bg-white"
                style={{ minHeight: '60px' }}
              >
                <option value="">All Months</option>
                {getUniqueRequiredByMonths().map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(filters.category || filters.requiredBy) && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="mt-6 px-6 py-3 text-lg"
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                    ID
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                    Category
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                    Product
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                    Quantity
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                    Reqd By
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDemands.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center text-xl text-gray-500">
                      No demands found
                    </td>
                  </tr>
                ) : (
                  filteredDemands.map((demand) => (
                    <React.Fragment key={demand.id}>
                      <tr
                        className="hover:bg-gray-50 transition cursor-pointer select-none"
                        onClick={() =>
                          setExpandedDemandId(
                            expandedDemandId === demand.id ? null : demand.id
                          )
                        }
                      >
                        <td className="px-8 py-6 text-lg text-gray-900">
                          #{demand.id}
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex px-4 py-2 text-base font-medium bg-blue-100 text-blue-700 rounded-lg">
                            {demand.category}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-lg text-gray-900">
                          {demand.product_name || (
                            <span className="text-purple-600 font-medium">
                              New: {demand.new_description}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-lg text-gray-900">
                          {demand.quantity ?? "-"}
                        </td>
                        <td className="px-8 py-6 text-lg text-gray-600">
                          {demand.required_by || "-"}
                        </td>
                        <td className="px-8 py-6 text-gray-400">
                          <div className="flex items-center gap-3">
                            {expandedDemandId === demand.id ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteDemand(e, demand.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete demand"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedDemandId === demand.id && (
                        <tr className="bg-indigo-50 border-t border-indigo-100">
                          <td colSpan="6" className="px-10 py-5">
                            <div className="flex flex-wrap gap-8 items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <User size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</p>
                                  <p className="text-lg font-semibold text-gray-900">{demand.name || "-"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                                  <Phone size={18} className="text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</p>
                                  <p className="text-lg font-semibold text-gray-900">{demand.contact_number || "-"}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemandsDashboard;
