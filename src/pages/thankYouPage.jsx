
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1000); // Redirect after 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1020] px-4 py-6 text-[#f1f5ff]">
      <div className="w-full max-w-md rounded-2xl border border-[#1a2547] bg-[#0d1730] p-6 text-center sm:rounded-3xl sm:p-10">
        {/* Check icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400 text-emerald-400">
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
        </div>

        <h1 className="mb-3 text-2xl font-semibold sm:text-3xl">
          {name ? `Thank you, ${name}` : "Thank you for registering"}
        </h1>

        <p className="mb-4 text-[#9aa8d6]">
          Your email has been confirmed successfully. Thank you for registering
          with Relay.
        </p>

        
      </div>
    </div>
  );
}
