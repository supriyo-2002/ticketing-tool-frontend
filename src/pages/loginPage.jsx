export default function loginPage() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2 bg-[#0a0e1a]">
      
      {/* LEFT SIDE - Branding panel */}
      <div className="relative flex flex-col justify-between overflow-hidden px-16 py-14 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 28%, #1e2a52 0%, transparent 45%), linear-gradient(160deg, #141b30 0%, #0a0e1a 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(circle at 20% 30%, black 0%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 20% 30%, black 0%, transparent 55%)",
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#5b6ef5] to-[#3d4bc7] shadow-[0_4px_14px_rgba(91,110,245,0.35)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M5 12.5L10 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#f3f5fb]">Relay</span>
        </div>

        {/* Middle text */}
        <div className="relative z-10 max-w-xl">
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-[#f3f5fb] sm:text-3xl">
            Every request, tracked from first message to resolution.
          </h1>
          <p className="mb-9 max-w-md text-[17px] leading-relaxed text-[#aab4d4]">
            Relay keeps organizations, projects and tickets in one place — so nothing sits unassigned and nothing gets forgotten.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-[9px] border border-[#2a3358] bg-[#161d33] px-4 py-2.5 text-sm font-semibold text-[#f3f5fb]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#5b6ef5]" />
              Open
            </span>
            <span className="hidden h-px w-11 bg-[#2a3358] sm:block" />
            <span className="inline-flex items-center gap-2 rounded-[9px] border border-[#2a3358] bg-[#161d33] px-4 py-2.5 text-sm font-semibold text-[#f3f5fb]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#f5a623]" />
              In progress
            </span>
            <span className="hidden h-px w-11 bg-[#2a3358] sm:block" />
            <span className="inline-flex items-center gap-2 rounded-[9px] border border-[#2a3358] bg-[#161d33] px-4 py-2.5 text-sm font-semibold text-[#f3f5fb]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#2ecf8e]" />
              Resolved
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[13px] text-[#6b7396]">
          Trusted by support and product teams across 40+ organizations
        </div>
      </div>

      {/* RIGHT SIDE - Sign in form */}
      <div className="flex flex-col justify-center bg-[#0d1326] px-24 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-sm">

          <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#f3f5fb]">
            Sign in to Relay
          </h2>
          <p className="mb-9 text-[15px] leading-relaxed text-[#aab4d4]">
            Enter your work email to access your organization's workspace.
          </p>

          <label className="mb-2 block text-sm font-semibold text-[#f3f5fb]">
            Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            className="mb-6 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none focus:border-[#5b6ef5]"
          />

          <label className="mb-2 block text-sm font-semibold text-[#f3f5fb]">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••••"
            className="mb-4 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none focus:border-[#5b6ef5]"
          />

          <div className="mb-6 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[#aab4d4]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#2a3358] bg-[#161d33] accent-[#5b6ef5]"
              />
              Keep me signed in
            </label>
            <a href="#" className="font-medium text-[#5b6ef5] hover:underline">
              Forgot password?
            </a>
          </div>

          <button className="mb-6 w-full rounded-lg bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(91,110,245,0.35)] transition hover:opacity-90">
            Sign in
          </button>

          <p className="text-center text-sm text-[#6b7396]">
            Don't have an account? Ask your organization admin to invite you.
          </p>
        </div>
      </div>
    </div>
  );
}