import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Package, ArrowLeft, FileSpreadsheet } from "lucide-react";
import { api } from "@/lib/api";

function BulkAddProducts() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.xlsx?$/i)) {
        setMessage("Only Excel files (.xlsx) are allowed");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setMessage("");
      setResult(null);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);
    setLoading(true);

    if (!file) {
      setMessage("Please select an Excel file");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const auth = localStorage.getItem("authToken");
      const data = await api.postFile("/products/bulk", formData, auth);

      setResult(data);
      setMessage(
        `Successfully added ${data.added} products. ${data.skipped} skipped. ${data.errors} errors.`
      );
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage(err.message || "Failed to process Excel file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-5 mb-10 animate-fade-in">
          <button
            onClick={() => navigate("/admin/products")}
            className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition"
          >
            <ArrowLeft size={28} className="text-gray-600" />
          </button>
          <div className="w-20 h-20 bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
            <FileSpreadsheet size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Bulk Add Products</h1>
            <p className="text-gray-500 text-lg mt-1">
              Upload an Excel file to add multiple products
            </p>
          </div>
        </div>

        <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-blue-700 mb-3">Excel File Format</h3>
          <ul className="text-lg text-blue-600 space-y-2 list-disc list-inside">
            <li>Each <strong>worksheet/sheet name</strong> is used as the <strong>Category</strong></li>
            <li>Each sheet must have <strong>INDEX NO</strong> column (Product Code)</li>
            <li>Each sheet must have <strong>Nomenclature</strong> column (Product Name)</li>
            <li>Products with duplicate codes will be skipped</li>
            <li>Missing categories will be created automatically</li>
          </ul>
        </div>

        {message && (
          <div
            className={`mb-8 px-8 py-6 rounded-[2rem] flex items-center gap-4 text-xl border-2 ${
              result && result.added > 0
                ? "bg-green-50 text-green-700 border-green-200"
                : message.includes("Failed") || message.includes("Only") || message.includes("Please")
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
            }`}
          >
            {result && result.added > 0 ? (
              <Check size={28} className="flex-shrink-0" />
            ) : (
              <X size={28} className="flex-shrink-0" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white rounded-[2rem] shadow-xl p-10 border-2 border-gray-100"
        >
          <div>
            <label className="block text-xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
              <FileSpreadsheet size={24} className="text-purple-500" />
              Excel File (.xlsx) *
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group touch-feedback">
              {file ? (
                <div className="flex flex-col items-center gap-4 p-6">
                  <FileSpreadsheet size={48} className="text-purple-500" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-700">{file.name}</p>
                    <p className="text-gray-400 text-base mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                      setResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-6 py-2 bg-red-500 text-white rounded-full text-base font-semibold hover:bg-red-600 transition active:scale-95"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-8 pb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-purple-100 transition">
                    <Upload className="w-10 h-10 text-gray-400 group-hover:text-purple-500" />
                  </div>
                  <p className="text-2xl text-gray-500 font-semibold">
                    Tap to upload Excel file
                  </p>
                  <p className="text-lg text-gray-400 mt-2">.xlsx files only</p>
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept=".xlsx,.xls"
                className="hidden"
              />
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !file}
            className="w-full py-6 text-xl font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-purple-300 active:scale-97 transition-all touch-feedback"
            style={{ minHeight: "75px" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg
                  className="animate-spin h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Package size={26} />
                Upload & Add Products
              </span>
            )}
          </Button>
        </form>

        {result && result.details && (
          <div className="mt-10 space-y-6">
            {result.details.added.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold text-green-700 mb-4">
                  Added ({result.details.added.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {result.details.added.map((item, i) => (
                    <p key={i} className="text-lg text-green-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {result.details.skipped.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold text-yellow-700 mb-4">
                  Skipped ({result.details.skipped.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {result.details.skipped.map((item, i) => (
                    <p key={i} className="text-lg text-yellow-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {result.details.errors.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold text-red-700 mb-4">
                  Errors ({result.details.errors.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {result.details.errors.map((item, i) => (
                    <p key={i} className="text-lg text-red-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkAddProducts;
