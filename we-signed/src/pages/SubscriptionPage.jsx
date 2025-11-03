import { useState } from "react";
import { initiatePayment } from "../utils/service.js";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../components/AlertContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

const plans = [
  { label: "2 Weeks", value: "2w", price: 500, description: "2 weeks subscription" },
  { label: "1 Month", value: "1m", price: 1000, description: "1 month subscription" },
  { label: "6 Months", value: "6m", price: 6000, description: "6 months subscription" },
  { label: "1 Year", value: "1y", price: 12000, description: "1 year subscription" },
];

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: plans[0].price,
    currency: "NGN",
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    description: plans[0].description,
  });

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setForm((f) => ({ ...f, amount: plan.price, description: plan.description }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await initiatePayment(form);
      if (response.data) {
        showAlert(response.data.message || "Redirecting to payment...", "success");
        const paymentUrl = response.data.checkoutUrl;
        window.location.href = paymentUrl;
      } else {
        showAlert(response.data.message || response.data.error, "error");
        setLoading(false);
      }
    } catch (err) {
      console.error("Subscription initiate payment error", err);
      showAlert(err.response?.data?.message || "Subscription failed. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200 flex flex-col items-center py-8 px-2">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && <SpinnerOverlay />}
      </AnimatePresence>

      <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 text-center">
          Choose Your Subscription Plan
        </h1>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
          {plans.map((plan) => (
            <button
              key={plan.value}
              type="button"
              onClick={() => handlePlanSelect(plan)}
              className={`rounded-xl border-2 p-5 flex flex-col items-center shadow transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400
                ${
                  selectedPlan.value === plan.value
                    ? "border-[#94c04c] bg-gradient-to-br from-blue-100 to-green-50 scale-105"
                    : "border-blue-200 bg-white hover:scale-105"
                }
              `}
            >
              <span className="text-lg font-bold text-blue-700 mb-1">{plan.label}</span>
              <span className="text-2xl font-extrabold text-[#94c04c] mb-1">
                ₦{plan.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">{plan.description}</span>
            </button>
          ))}
        </div>

        {/* Subscription Form */}
        <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-indigo-50 text-indigo-900 text-lg"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Currency</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-indigo-50 text-indigo-900 text-lg"
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Customer Email</label>
            <input
              type="email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-indigo-50 text-indigo-900 text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-indigo-50 text-indigo-900 text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Customer Phone</label>
            <input
              type="tel"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-indigo-50 text-indigo-900 text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-indigo-50 text-indigo-900 text-lg"
              readOnly
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#273c72] to-[#94c04c] text-white font-semibold text-lg shadow-md hover:from-[#23376b] hover:to-[#669b11] hover:scale-105 transition-all hover:cursor-pointer mt-2"
          >
            {!loading ? "Subscribe Now" : "Processing..."}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Spinner Component */
const Spinner = () => {
  return (
    <motion.div
      className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  );
};

/* Spinner Overlay */
const SpinnerOverlay = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Spinner />
      <p className="text-white mt-4 text-lg font-medium">Processing payment...</p>
    </motion.div>
  );
};
