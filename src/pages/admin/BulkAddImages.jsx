import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, X, Check, ArrowLeft, ImagePlus, FolderOpen } from "lucide-react";
import { api } from "@/lib/api";

function BulkAddImages() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFolderSelect = (e) => {
    const selected = Array.from(e.target.files).filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return ["jpg", "jpeg", "png"].includes(ext);
    });

    if (selected.length === 0) {
      setMessage("No valid image files (JPG/PNG) found in the selected folder");
      return;
    }

    setFiles(selected);
    setMessage("");
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);
    setLoading(true);

    if (files.length === 0) {
      setMessage("Please select a folder containing product images");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const auth = localStorage.getItem("authToken");
      const data = await api.postFile("/products/bulk-images", formData, auth);

      setResult(data);
      setMessage(
        `Matched ${data.matched} images. ${data.not_found} not found. ${data.errors} errors.`
      );
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage(err.message || "Failed to upload images");
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
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-xl">
            <ImagePlus size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Bulk Add Images</h1>
            <p className="text-gray-500 text-lg mt-1">
              Select a folder of product images to upload
            </p>
          </div>
        </div>

        <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-blue-700 mb-3">How it works</h3>
          <ul className="text-lg text-blue-600 space-y-2 list-disc list-inside">
            <li>Select a folder containing product images (JPG/PNG)</li>
            <li>Image <strong>filename</strong> must match the <strong>Product Code</strong></li>
            <li>Example: product code <code className="bg-blue-100 px-2 py-1 rounded">OD01</code> → image named <code className="bg-blue-100 px-2 py-1 rounded">OD01.jpg</code></li>
            <li>Existing images will be replaced</li>
          </ul>
        </div>

        {message && (
          <div
            className={`mb-8 px-8 py-6 rounded-[2rem] flex items-center gap-4 text-xl border-2 ${
              result && result.matched > 0
                ? "bg-green-50 text-green-700 border-green-200"
                : message.includes("Failed") || message.includes("No valid") || message.includes("Please")
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
            }`}
          >
            {result && result.matched > 0 ? (
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
              <FolderOpen size={24} className="text-orange-500" />
              Select Image Folder *
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group touch-feedback">
              {files.length > 0 ? (
                <div className="flex flex-col items-center gap-4 p-6">
                  <ImagePlus size={48} className="text-orange-500" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-700">
                      {files.length} image{files.length !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-gray-400 text-base mt-1">
                      {files.slice(0, 5).map((f) => f.name).join(", ")}
                      {files.length > 5 ? `, +${files.length - 5} more` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFiles([]);
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
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-orange-100 transition">
                    <FolderOpen className="w-10 h-10 text-gray-400 group-hover:text-orange-500" />
                  </div>
                  <p className="text-2xl text-gray-500 font-semibold">
                    Tap to select a folder
                  </p>
                  <p className="text-lg text-gray-400 mt-2">
                    JPG and PNG images only
                  </p>
                </div>
              )}
              {/* @ts-ignore */}
              <input
                type="file"
                onChange={handleFolderSelect}
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                webkitdirectory=""
                directory=""
                multiple
              />
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || files.length === 0}
            className="w-full py-6 text-xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 shadow-lg shadow-orange-300 active:scale-97 transition-all touch-feedback"
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
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Upload size={26} />
                Upload & Map Images
              </span>
            )}
          </Button>
        </form>

        {result && result.details && (
          <div className="mt-10 space-y-6">
            {result.details.matched.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold text-green-700 mb-4">
                  Matched ({result.details.matched.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {result.details.matched.map((item, i) => (
                    <p key={i} className="text-lg text-green-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {result.details.not_found.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold text-yellow-700 mb-4">
                  No Matching Product ({result.details.not_found.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {result.details.not_found.map((item, i) => (
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

export default BulkAddImages;
