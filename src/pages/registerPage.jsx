
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerOrganization } from "../api/auth";

const inputClass =
  "mb-5 w-full rounded-lg border border-[#2a3358] bg-[#161d33] px-4 py-3 text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5]";

const labelClass =
  "mb-2 block text-sm font-semibold text-[#f3f5fb]";

export default function Register() {
  const [form, setForm] = useState({
    organization: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (
      !form.organization.trim() ||
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("Please fill in all required fields.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (!form.agree) {
      toast.error(
        "Please accept the Terms of Service and Privacy Policy.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        }
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await registerOrganization({
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        organizationName: form.organization.trim(),
      });

      toast.success(
        result.emailConfirmationRequired
          ? "Registration successful! Please check your email and confirm your account before logging in."
          : result.message || "Registration successful!",
        {
          position: "top-right",
          autoClose: 6000,
          theme: "dark",
        }
      );

      // Keep the user on this page after successful registration.
      setForm({
        organization: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });
    } catch (err) {
      toast.error(
        err?.message || "Registration failed. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-[#0a0e1a] md:grid-cols-2">
      {/* LEFT SIDE - Branding panel */}
      <div className="relative flex flex-col justify-between gap-10 overflow-hidden px-6 py-8 sm:px-8 md:gap-0 md:px-16 md:py-14">
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

        {/* Middle content */}
        <div className="relative z-10 max-w-xl">
          <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-[#f3f5fb] md:text-4xl">
            Bring your organization and tickets together.
          </h1>

          <p className="mb-9 max-w-md text-base leading-relaxed text-[#aab4d4] md:text-[17px]">
            Create your Relay account and manage organizations, projects, and
            support tickets in one organized workspace.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              "Centralized ticket management",
              "Organized team collaboration",
              "Simple request tracking",
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm font-medium text-[#f3f5fb]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#161d33] text-[#5b6ef5]">
                  ✓
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 hidden text-[13px] text-[#6b7396] md:block">
          Trusted by support and product teams across 40+ organizations
        </div>
      </div>

      {/* RIGHT SIDE - Register form */}
      <div className="flex flex-col justify-center bg-[#0d1326] px-6 py-10 sm:px-8 md:px-16 lg:px-24 md:py-14">
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-sm"
        >
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#f3f5fb]">
            Create your account
          </h2>

          <p className="mb-8 text-[15px] leading-relaxed text-[#aab4d4]">
            Enter your details to create your Relay account.
          </p>

          <label htmlFor="organization" className={labelClass}>
            Organization
          </label>
          <input
            id="organization"
            name="organization"
            type="text"
            required
            placeholder="Your organization name"
            value={form.organization}
            onChange={handleChange}
            disabled={submitting}
            className={inputClass}
          />

          <label htmlFor="fullName" className={labelClass}>
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={handleChange}
            disabled={submitting}
            className={inputClass}
          />

          <label htmlFor="email" className={labelClass}>
            Work Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            disabled={submitting}
            className={inputClass}
          />

          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            disabled={submitting}
            className={inputClass}
          />

          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={submitting}
            className={inputClass}
          />

          {/* Terms */}
          <label className="mb-6 flex cursor-pointer items-start gap-2 text-sm text-[#aab4d4]">
            <input
              name="agree"
              type="checkbox"
              checked={form.agree}
              onChange={handleChange}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 rounded border-[#2a3358] bg-[#161d33] accent-[#5b6ef5]"
            />
            <span>
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          {/* Register button */}
          <button
            type="submit"
            disabled={submitting}
            className="mb-6 w-full rounded-lg bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(91,110,245,0.35)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create Account"}
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
        </form>
      </div>
    </div>
  );
}
