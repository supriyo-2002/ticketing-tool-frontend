
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/+$/, "");

const inputClasses =
  "w-full rounded-lg border border-[#293653] bg-[#080d18] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClasses = "text-xs font-medium text-slate-300";

// Read invitation information from the URL.
function readInviteLink() {
  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );
  const queryParams = new URLSearchParams(window.location.search);

  const get = (key) => hashParams.get(key) || queryParams.get(key);

  return {
    accessToken: get("access_token"),
    token: get("token"),
    tokenHash: get("token_hash"),
    error:
      get("error_description") ||
      get("error_code") ||
      get("error"),
    type: get("type"),
  };
}

// Decode the email from a JWT, if one is provided.
// The backend must still validate the token.
function getEmailFromToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return "";

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );

    const decoded = atob(padded);
    const bytes = Uint8Array.from(
      decoded,
      (character) => character.charCodeAt(0)
    );

    return JSON.parse(new TextDecoder().decode(bytes)).email || "";
  } catch {
    return "";
  }
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>

        {hint && (
          <span className={`text-[11px] ${hint.color}`}>
            {hint.text}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClasses} pr-14`}
          minLength={8}
          required
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400 hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export default function AcceptInvite() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [tokenHash, setTokenHash] = useState("");
  const [tokenType, setTokenType] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const desktop = window.matchMedia("(min-width: 1024px)");

    const applySize = () => {
      root.style.fontSize = desktop.matches ? "80%" : "";
    };

    applySize();
    desktop.addEventListener("change", applySize);

    return () => {
      desktop.removeEventListener("change", applySize);
      root.style.fontSize = "";
    };
  }, []);

  useEffect(() => {
    const invite = readInviteLink();

    if (invite.error) {
      const message = invite.error.replace(/\+/g, " ");

      setError(
        /expired|otp/i.test(message)
          ? "This invitation link has expired or has already been used. Please request a new invitation."
          : decodeURIComponent(message)
      );
      return;
    }

    const accessToken = invite.accessToken || invite.token || "";

    setToken(accessToken);
    setTokenHash(invite.tokenHash || "");
    setTokenType(invite.type || "");
    setEmail(getEmailFromToken(accessToken));

    if (!accessToken && !invite.tokenHash) {
      setError(
        "No invitation credential was found in this link. Please open a valid invitation email or request a new one."
      );
    }
  }, []);

  const matchHint = confirmPassword
    ? password === confirmPassword
      ? { text: "Passwords match", color: "text-emerald-400" }
      : { text: "Do not match", color: "text-rose-400" }
    : null;

  const canSubmit =
    !loading &&
    fullName.trim().length >= 2 &&
    password.length >= 8 &&
    password === confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!API) {
      setError("API URL is missing. Check your frontend .env file.");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!token && !tokenHash) {
      setError(
        "Your invitation credential is missing. Please request a new invitation email."
      );
      return;
    }

    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const body = {
        name: fullName.trim(),
        password,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // These fields only work if the backend supports token_hash/type.
      if (tokenHash) body.token_hash = tokenHash;
      if (tokenType) body.type = tokenType;

      const response = await fetch(`${API}/api/auth/accept-invite`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `The server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            `Could not accept the invitation (HTTP ${response.status}).`
        );
      }

      setSuccess(data.message || "Invitation accepted successfully.");
      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080d18] px-4 py-4 text-white">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="mb-4 flex items-center justify-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6482ff] to-[#4558df] text-lg font-bold">
            ✓
          </span>
          <span className="text-xl font-bold tracking-tight">
            Relay
          </span>
        </Link>

        <div className="rounded-2xl border border-[#202943] bg-[#0c1427] p-5 shadow-2xl">
          <div className="mb-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              ✉ Team Invitation
            </p>
            <h1 className="mt-1.5 text-xl font-bold">
              Accept your invitation
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Complete your details to get started with your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className={email ? "" : "sm:col-span-2"}>
                <label
                  htmlFor="fullName"
                  className={`${labelClasses} mb-1.5 block`}
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your full name"
                  className={inputClasses}
                  required
                />
              </div>

              {email && (
                <div>
                  <label
                    htmlFor="email"
                    className={`${labelClasses} mb-1.5 block`}
                  >
                    Work Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border border-[#293653] bg-[#080d18] px-3.5 py-2.5 text-sm text-slate-400 outline-none"
                  />
                </div>
              )}

              <PasswordField
                id="password"
                label="Create Password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Min. 8 characters"
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                placeholder="Re-enter password"
                hint={matchHint}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
              >
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#6482ff] to-[#4558df] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0c1427] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Accepting..." : "Accept Invitation"}
            </button>
          </form>

          <p className="mt-3.5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
