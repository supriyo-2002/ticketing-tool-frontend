import { useLocation, useNavigate } from "react-router-dom";

export default function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name; // optional, passed from the register page

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
        <p className="mb-8 text-[#9aa8d6]">
          Your account has been created. You can now log in and start using
          Relay.
        </p>

        <button
  onClick={() => navigate("/")}
  className="w-full rounded-2xl bg-[#4a7cff] py-3.5 text-base font-bold text-white transition hover:brightness-110 sm:py-4 sm:text-lg"
>
  Go back to login
</button>
      </div>
    </div>
  );
}