import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Heart, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";

function SubmitFeedback() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const emojiLabels = [
    { value: 1, emoji: "😞", label: "Very Sad" },
    { value: 2, emoji: "🙁", label: "Sad" },
    { value: 3, emoji: "😐", label: "Neutral" },
    { value: 4, emoji: "🙂", label: "Happy" },
    { value: 5, emoji: "😄", label: "Very Happy" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (rating === 0) {
      setMessage("Please select a rating");
      setLoading(false);
      return;
    }

    try {
      await api.post("/feedback", {
        rating,
        text: comment || null,
      });

      setMessage("Feedback submitted. Thank you!");
      setRating(0);
      setComment("");
    } catch (err) {
      setMessage(err.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-5 mb-10 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 rounded-3xl flex items-center justify-center shadow-xl">
            <Heart size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Share Your Feedback</h1>
            <p className="text-gray-500 text-lg mt-1">Help us improve your experience</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-8 px-8 py-6 rounded-[2rem] flex items-center gap-4 text-xl border-2 ${
              message.includes("success") || message.includes("Thank")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.includes("success") || message.includes("Thank") ? (
              <Check size={28} className="flex-shrink-0" />
            ) : null}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2rem] shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-100"
        >
          <div className="mb-6">
            <label className="block text-2xl font-bold text-gray-800 mb-8 text-center">
              How was your shopping experience at URC MCTE?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {emojiLabels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRating(item.value)}
                  onMouseEnter={() => setHoverRating(item.value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`flex w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8 rounded-[1.5rem] transition-all transform active:scale-95 touch-feedback ${
                    rating === item.value || hoverRating === item.value
                      ? "bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 ring-4 ring-pink-300 shadow-lg scale-105"
                      : "hover:bg-gray-50 hover:scale-105"
                  }`}
                >
                  <span className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4">{item.emoji}</span>
                  <span className="text-base sm:text-lg font-semibold text-gray-700">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-5 text-3xl font-bold text-pink-600 animate-fade-in">
                {emojiLabels[rating - 1].emoji}{" "}
                <span className="text-gray-700">{emojiLabels[rating - 1].label}</span>
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
              <MessageCircle size={24} className="text-pink-500" />
              Comments <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-6 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all resize-none active:scale-98"
              placeholder="Tell us more about your experience..."
            />
          </div>

          <Button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full py-5 text-xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 shadow-lg shadow-pink-300 active:scale-97 transition-all touch-feedback"
            style={{ minHeight: '64px' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-7 w-7" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Heart size={26} />
                Submit Feedback
              </span>
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}

export default SubmitFeedback;
