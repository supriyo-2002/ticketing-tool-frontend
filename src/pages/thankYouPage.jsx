
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function ThankYouPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Your email is being verified. Please wait..."
  );

  const requestStarted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (requestStarted.current) return;

    requestStarted.current = true;

    const completeRegistration = async () => {
      try {
        const queryParams = new URLSearchParams(
          window.location.search
        );

        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );

        // Read authentication errors.
        const authError =
          hashParams.get("error") ||
          queryParams.get("error");

        const errorDescription =
          hashParams.get("error_description") ||
          queryParams.get("error_description");

        const errorCode =
          hashParams.get("error_code") ||
          queryParams.get("error_code");

        if (authError) {
          throw new Error(
            errorDescription || errorCode || authError
          );
        }

        // Read access token.
        const accessToken =
          hashParams.get("access_token") ||
          queryParams.get("access_token");

        if (!accessToken) {
          throw new Error(
            "Confirmation token not found. Please request a fresh confirmation email."
          );
        }

        // Call existing registration completion API.
        const response = await axiosInstance.post(
          "/api/auth/complete-registration",
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data?.success === false) {
          throw new Error(
            response.data.message ||
              "Unable to complete registration."
          );
        }

        // Remove tokens from the browser URL.
        window.history.replaceState(
          null,
          "",
          window.location.pathname
        );

        setStatus("success");

        setMessage(
          response.data?.message ||
            "Your organization and administrator account have been created successfully."
        );
      } catch (error) {
        console.error(
          "Registration completion error:",
          error.response?.data || error
        );

        setStatus("error");

        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Unable to complete registration. Please try again."
        );
      }
    };

    completeRegistration();
  }, []);

  // Redirect to login 5 seconds after successful registration.
  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1020] px-4 py-6 text-[#f1f5ff]">
      <div className="w-full max-w-md rounded-2xl border border-[#1a2547] bg-[#0d1730] p-6 text-center sm:rounded-3xl sm:p-10">

        {/* Status icon */}
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border ${
            status === "error"
              ? "border-red-400 text-red-400"
              : "border-emerald-400 text-emerald-400"
          }`}
        >
          {status === "loading" ? (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#26365d] border-t-emerald-400" />
          ) : status === "error" ? (
            <span className="text-3xl">!</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </div>

        {/* Heading */}
        <h1 className="mb-3 text-2xl font-semibold sm:text-3xl">
          {status === "loading"
            ? "Verifying Your Email"
            : status === "success"
              ? "Registration Successful!"
              : "Registration Incomplete"}
        </h1>

        {/* Message */}
        <p className="mb-4 text-[#9aa8d6]">
          {message}
        </p>

        {/* Success redirect message */}
        {status === "success" && (
          <p className="mt-4 text-sm text-emerald-400">
            Your Relay account is ready.
            <br />
            Redirecting you to login in 5 seconds...
          </p>
        )}

        {/* Error action */}
        {status === "error" && (
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}
