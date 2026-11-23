
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://ticketing-tool-backend-teal.vercel.app"
).replace(/\/+$/, "");

const API_BASE = API_ROOT.endsWith("/api")
  ? API_ROOT
  : `${API_ROOT}/api`;

const RESET_PASSWORD_API = `${API_BASE}/auth/reset-password`;

const REDIRECT_SECONDS = 5;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Success popup + countdown
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  // Read tokens from query string or URL hash
  const [tokens] = useState(() => {
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );

    return {
      tokenHash:
        searchParams.get("token_hash") ||
        searchParams.get("token") ||
        hashParams.get("token_hash") ||
        hashParams.get("token") ||
        "",

      accessToken:
        hashParams.get("access_token") ||
        searchParams.get("access_token") ||
        "",

      refreshToken:
        hashParams.get("refresh_token") ||
        searchParams.get("refresh_token") ||
        "",

      linkError:
        hashParams.get("error_description") ||
        searchParams.get("error_description") ||
        "",
    };
  });

  const resetToken = tokens.tokenHash || tokens.accessToken;

  // Handle invalid or expired reset links
  useEffect(() => {
    if (tokens.linkError) {
      setError(
        tokens.linkError.replace(/\+/g, " ") +
          " Please request a new reset email."
      );
    }
  }, [tokens.linkError]);

  // Redirect after successful password reset
  useEffect(() => {
    if (!showSuccessPopup) return;

    if (countdown <= 0) {
      navigate("/", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showSuccessPopup, countdown, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!resetToken) {
      setError(
        "Password reset token is missing. Please request a new reset email."
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Send token_hash or access_token + refresh_token
      const payload = {
        password,
        confirmPassword,
      };

      if (tokens.tokenHash) {
        payload.token_hash = tokens.tokenHash;
      } else {
        payload.access_token = tokens.accessToken;
        payload.refresh_token = tokens.refreshToken;
      }

      const response = await fetch(RESET_PASSWORD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Password reset failed. Status: ${response.status}`
        );
      }

      setPassword("");
      setConfirmPassword("");

      // Remove tokens from the address bar
      window.history.replaceState(
        null,
        "",
        window.location.pathname
      );

      setCountdown(REDIRECT_SECONDS);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        err.message || "Unable to reset password. Please try again."
      );
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

          {/* Password Icon */}
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
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <path d="M12 15v3" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-white mb-3">
              Reset Your Password
            </h2>

            <p className="text-gray-400 text-sm leading-6">
              Create a new password for your Relay account. Enter your new
              password below.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPassword}>

            {/* New Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                  disabled={loading || showSuccessPopup}
                  className="w-full bg-[#0b1220] border border-gray-700 rounded-xl px-4 py-3.5 pr-16 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-blue-400 hover:text-blue-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Password must contain at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  disabled={loading || showSuccessPopup}
                  className="w-full bg-[#0b1220] border border-gray-700 rounded-xl px-4 py-3.5 pr-16 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-blue-400 hover:text-blue-300"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || showSuccessPopup}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-7">
            <Link
              to="/"
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

      {/* Success Popup */}
      {showSuccessPopup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-success-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
          <div className="w-full max-w-sm bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">

            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h3
              id="reset-success-title"
              className="text-xl font-bold text-white mb-2"
            >
              Reset Password successfully
            </h3>

            <p className="text-gray-400 text-sm">
              Redirecting to login page in{" "}
              <span className="text-white font-semibold">
                {countdown}
              </span>{" "}
              second{countdown === 1 ? "" : "s"}...
            </p>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Go to Login now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
