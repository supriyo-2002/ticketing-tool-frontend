import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-[#0a0e1a] md:grid-cols-2">

      {/* LEFT SIDE - Branding panel */}
      <div className="relative flex flex-col justify-between overflow-hidden px-16 py-14 sm:px-8 sm:py-8">

        {/* Background gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 28%, #1e2a52 0%, transparent 45%), linear-gradient(160deg, #141b30 0%, #0a0e1a 70%)",
          }}
        />

        {/* Background dots */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(circle at 20% 30%, black 0%, transparent 55%)",
            WebkitMaskImage:
              "radial-gradient(circle at 20% 30%, black 0%, transparent 55%)",
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
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

          <span className="text-xl font-bold tracking-tight text-[#f3f5fb]">
            Relay
          </span>
        </div>

        {/* Middle content */}
        <div className="relative z-10 max-w-xl">
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-[#f3f5fb] sm:text-3xl">
            Bring your organization and tickets together.
          </h1>

          <p className="mb-9 max-w-md text-[17px] leading-relaxed text-[#aab4d4]">
            Create your Relay account and manage organizations,
            projects, and support tickets in one organized workspace.
          </p>

          {/* Features */}
          <div className="space-y-4">

            <div className="flex items-center gap-3 text-sm font-medium text-[#f3f5fb]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#161d33] text-[#5b6ef5]">
                ✓
              </span>
              Centralized ticket management
            </div>

            <div className="flex items-center gap-3 text-sm font-medium text-[#f3f5fb]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#161d33] text-[#5b6ef5]">
                ✓
              </span>
              Organized team collaboration
            </div>

            <div className="flex items-center gap-3 text-sm font-medium text-[#f3f5fb]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#161d33] text-[#5b6ef5]">
                ✓
              </span>
              Simple request tracking
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[13px] text-[#6b7396]">
          Trusted by support and product teams across 40+ organizations
        </div>
      </div>

      {/* RIGHT SIDE - Register form */}
      <div className="flex flex-col justify-center bg-[#0d1326] px-24 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-sm">

          <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#f3f5fb]">
            Create your account
          </h2>

          <p className="mb-8 text-[15px] leading-relaxed text-[#aab4d4]">
            Enter your details to create your Relay account.
          </p>

          {/* Organization */}
          <label className="mb-2 block text-sm font-semibold text-[#f3f5fb]">
            Organization
          </label>

          <input
            type="text"
            placeholder="Your organization name"
            className="mb-5 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5]"
          />

          {/* Full Name */}
          <label className="mb-2 block text-sm font-semibold text-[#f3f5fb]">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            className="mb-5 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5]"
          />

          {/* Email */}
          <label className="mb-2 block text-sm font-semibold text-[#f3f5fb]">
            Work Email
          </label>

          <input
            type="email"
            placeholder="you@company.com"
            className="mb-5 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5]"
          />

          {/* Password */}
          <label className="mb-2 block text-sm font-semibold text-[#f3f5fb]">
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            className="mb-5 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5]"
          />

          {/* Confirm Password */}
          <label className="mb-2 block text-sm font-semibold text-[#f3f5fb]">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm your password"
            className="mb-5 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5]"
          />

          {/* Terms */}
          <label className="mb-6 flex cursor-pointer items-start gap-2 text-sm text-[#aab4d4]">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-[#2a3358] bg-[#161d33] accent-[#5b6ef5]"
            />

            <span>
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          {/* Register button */}
          <button
            type="button"
            className="mb-6 w-full rounded-lg bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(91,110,245,0.35)] transition hover:opacity-90"
          >
            Create Account
          </button>

          {/* Login link */}
          <p className="text-center text-sm text-[#6b7396]">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-medium text-[#5b6ef5] hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}