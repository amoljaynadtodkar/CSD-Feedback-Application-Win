import { useState, useEffect } from "react";
import { Filter, BarChart3, Star, MessageCircle, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api } from "@/lib/api";

function FeedbackDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = feedback;
    
    if (filters.rating) {
      filtered = filtered.filter((f) => f.rating === parseInt(filters.rating));
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      filtered = filtered.filter((f) => new Date(f.timestamp) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((f) => new Date(f.timestamp) <= to);
    }
    
    setFilteredFeedback(filtered);
  }, [filters, feedback]);

  const loadData = async () => {
    try {
      const auth = localStorage.getItem("authToken");
      const [feedbackData, statsData] = await Promise.all([
        api.get("/feedback", { requiresAuth: true, headers: { Authorization: `Basic ${btoa(auth)}` } }),
        api.get("/feedback/stats", { requiresAuth: true, headers: { Authorization: `Basic ${btoa(auth)}` } }),
      ]);
      setFeedback(feedbackData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ rating: "", dateFrom: "", dateTo: "" });
  };

  const handleDeleteFeedback = async (feedbackId) => {
    console.log("Attempting to delete feedback with ID:", feedbackId);
    
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      const auth = localStorage.getItem("authToken");
      console.log("Making DELETE request to:", `/feedback/${feedbackId}`);
      
      await api.delete(`/feedback/${feedbackId}`, { 
        requiresAuth: true,
        headers: { Authorization: `Basic ${btoa(auth)}` }
      });
      
      console.log("Successfully deleted feedback with ID:", feedbackId);
      
      // Remove the deleted feedback from the state
      setFeedback(prevFeedback => prevFeedback.filter(f => f.id !== feedbackId));
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      alert("Failed to delete feedback. Please try again.");
    }
  };

  const getRatingEmoji = (rating) => {
    const emojis = ["😞", "🙁", "😐", "🙂", "😄"];
    return emojis[rating - 1] || "😐";
  };

  const getRatingLabel = (rating) => {
    const labels = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"];
    return labels[rating - 1] || "Unknown";
  };

  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: getRatingLabel(rating),
    count: filteredFeedback.filter((f) => f.rating === rating).length,
    emoji: getRatingEmoji(rating),
  }));

  const filteredCount = filteredFeedback.length;
  const filteredAverageRating = filteredCount
    ? (filteredFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / filteredCount).toFixed(1)
    : 0;
  const filteredSatisfaction = filteredCount
    ? ((filteredFeedback.filter((f) => f.rating >= 4).length / filteredCount) * 100).toFixed(0)
    : 0;

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

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

                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Filter size={24} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) =>
                  setFilters({ ...filters, rating: e.target.value })
                }
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 bg-white"
                style={{ minHeight: '60px' }}
              >
                <option value="">All Ratings</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} - {getRatingLabel(rating)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400"
                style={{ minHeight: '60px' }}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400"
                style={{ minHeight: '60px' }}
              />
            </div>
          </div>

          {(filters.rating || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-3 text-lg border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Customer Feedback</h1>
            <p className="text-gray-500 text-lg mt-1">Analyze customer ratings and reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Star size={28} className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Average Rating</h3>
                <p className="text-gray-500 text-sm">out of 5 stars</p>
              </div>
            </div>
            <p className="text-6xl font-bold text-gray-900">{filteredAverageRating}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <MessageCircle size={28} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Total Feedback</h3>
                <p className="text-gray-500 text-sm">submissions</p>
              </div>
            </div>
            <p className="text-6xl font-bold text-gray-900">{filteredCount}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <BarChart3 size={28} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Satisfaction</h3>
                <p className="text-gray-500 text-sm">4-5 star ratings</p>
              </div>
            </div>
            <p className="text-6xl font-bold text-gray-900">
              {filteredSatisfaction}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="emoji" tick={{ fontSize: 24 }} />
                <YAxis tick={{ fontSize: 16 }} />
                <Tooltip 
                  contentStyle={{ fontSize: '16px', padding: '12px' }}
                  formatter={(value) => [`${value} reviews`, 'Count']}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Rating Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistribution.filter((r) => r.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.emoji} ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ fontSize: '16px', padding: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>



        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">ID</th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">Rating</th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">Comments</th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">Timestamp</th>
                  <th className="px-8 py-5 text-left text-lg font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFeedback.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center text-xl text-gray-500">
                      No feedback found
                    </td>
                  </tr>
                ) : (
                  filteredFeedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-8 py-6 text-lg text-gray-900">#{item.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{getRatingEmoji(item.rating)}</span>
                          <span className="text-lg text-gray-600">({item.rating}/5)</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-lg text-gray-900 max-w-md">
                        {item.text || (
                          <span className="text-gray-400 italic">No comments</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-lg text-gray-600">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
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

export default FeedbackDashboard;
