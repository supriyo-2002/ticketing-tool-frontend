
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [message, setMessage] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage(null);

    if (!email.trim() || !password) {
      showMessage("error", "Please enter your email and password.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      showMessage("success", "You are logged in successfully!");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);

    } catch (err) {
      showMessage(
        "error",
        err?.message || "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showMessage(
      "info",
      "Please contact your organization admin to reset your password."
    );
  };

  const messageStyles = {
    success: {
      container: "border-emerald-700 bg-emerald-950/50 text-emerald-300",
      icon: "✓",
    },
    error: {
      container: "border-rose-700 bg-rose-950/50 text-rose-300",
      icon: "!",
    },
    info: {
      container: "border-blue-700 bg-blue-950/50 text-blue-300",
      icon: "i",
    },
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-[#0a0e1a] md:grid-cols-2">

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
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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

        {/* Middle text */}
        <div className="relative z-10 max-w-xl">
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-[#f3f5fb] sm:text-3xl">
            Every request, tracked from first message to resolution.
          </h1>

          <p className="mb-9 max-w-md text-[17px] leading-relaxed text-[#aab4d4]">
            Relay keeps organizations, projects and tickets in one place —
            so nothing sits unassigned and nothing gets forgotten.
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

          {/* Inline notification banner */}
          {message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                messageStyles[message.type].container
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                {messageStyles[message.type].icon}
              </span>

              <p className="flex-1 leading-relaxed">
                {message.text}
              </p>

              <button
                type="button"
                onClick={() => setMessage(null)}
                className="shrink-0 text-lg leading-none opacity-70 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>

            {/* Email */}
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#f3f5fb]"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
              className="mb-6 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none focus:border-[#5b6ef5] disabled:cursor-not-allowed disabled:opacity-60"
            />

            {/* Password */}
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#f3f5fb]"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              required
              className="mb-4 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none focus:border-[#5b6ef5] disabled:cursor-not-allowed disabled:opacity-60"
            />

            {/* Remember me and forgot password */}
            <div className="mb-6 flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-[#aab4d4]">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(event) =>
                    setKeepSignedIn(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-[#2a3358] bg-[#161d33] accent-[#5b6ef5]"
                />
                Keep me signed in
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-[#5b6ef5] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="mb-6 w-full rounded-lg bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(91,110,245,0.35)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          <div className="mt-2 text-center">
  <p className="text-sm text-[#6b7396]">
    Don't have an account?
  </p>

  <p className="mt-2 text-sm leading-relaxed text-[#aab4d4]">
    Your organization admin can invite you to join Relay.
    Check your email for an invitation link to activate your account.
  </p>
</div>
        </div>
      </div>
    </div>
  );
}
