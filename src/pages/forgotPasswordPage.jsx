
import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://ticketing-tool-backend-teal.vercel.app/api"
).replace(/\/+$/, "");

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("info");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage("Please enter your registered email address.");
      setMessageType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `Request failed with status ${response.status}.`
        );
      }

      setMessage(
        data.message ||
        "If an account exists for this email, a password reset link will be sent."
      );

      setMessageType("success");
    } catch (error) {
      console.error("Forgot password error:", error);

      setMessage(
        error.message ||
        "Unable to connect to the server. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d18] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Relay Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#5b6ef5] to-[#3d4bc7] shadow-[0_4px_14px_rgba(91,110,245,0.35)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >
                <path
                  d="M5 12.5L10 17L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-wide">
              Relay
            </h1>
          </div>

          <p className="text-gray-400 text-sm">
            Ticket Management Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-7 sm:p-9 shadow-2xl">

          {/* Email Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-white mb-3">
              Forgot your password?
            </h2>

            <p className="text-gray-400 text-sm leading-6">
              Don't worry! It happens. Enter your registered email
              address and we'll help you reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
              }}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
              disabled={loading}
              className="w-full bg-[#0b1220] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            />

            {/* Feedback */}
            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-4 rounded-lg border px-3 py-3 text-sm ${
                  messageType === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                }`}
              >
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-7">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              <span>←</span>
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-7">
          © 2026 Relay. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
