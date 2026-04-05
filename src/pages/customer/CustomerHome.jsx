import { useNavigate } from "react-router-dom";
import { ShoppingBag, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { api } from "../../lib/api.js";
import mctelogo from "../../ui/assets/mcte.png"

function CustomerHome() {
  
  const navigate = useNavigate();
  return (
    <div className="p-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-8 py-4 rounded-full text-3xl font-semibold mb-8 shadow-md">
            <img src={mctelogo} alt="MCTE Logo" className="w-12 h-12" />
            Welcome to MCTE URC
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-5">
            How Can We Help You?
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
            Share your demand & feedback and help us improve our products and services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div
            onClick={() => navigate("/customer/demand")}
            className="bg-white rounded-[2rem] shadow-xl p-12 hover:shadow-2xl transition-all duration-300 cursor-pointer group active:scale-97 touch-feedback animate-slide-up border-2 border-transparent hover:border-indigo-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag size={56} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Request a Product
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-md">
                Can't find what you're looking for? Let us know what products
                you'd like to see in our store.
              </p>
              <div className="flex items-center gap-3 text-xl font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>Submit Request</span>
                <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/customer/feedback")}
            className="bg-white rounded-[2rem] shadow-xl p-12 hover:shadow-2xl transition-all duration-300 cursor-pointer group active:scale-97 touch-feedback animate-slide-up border-2 border-transparent hover:border-green-200"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-cyan-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={56} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Give Feedback
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-md">
                Share your shopping experience with us. Your feedback helps us improve
                our products and services.
              </p>
              <div className="flex items-center gap-3 text-xl font-bold text-green-600 group-hover:text-green-700">
                <span>Rate Experience</span>
                <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerHome;
