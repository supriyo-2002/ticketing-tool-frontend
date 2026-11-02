
import { useState } from "react";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/+$/, "");

const ROLES = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "ADMIN", label: "Admin" },
];

const roleBadge = {
  ADMIN: "bg-[#1b2f6b] text-[#7aa2ff]",
  EMPLOYEE: "bg-[#1a2238] text-[#aab4d4]",
};

const avatarColors = [
  "#4a7cff",
  "#f5a623",
  "#2ecf8e",
  "#a78bfa",
  "#fb7185",
  "#38bdf8",
];

const colorFor = (text) => {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return avatarColors[sum % avatarColors.length];
};

const initials = (email) => email.slice(0, 2).toUpperCase();

const formatTime = (d) =>
  new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function InvitesPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sent, setSent] = useState([]);

  const cancel = () => {
    setEmail("");
    setRole("EMPLOYEE");
    setError("");
    setSuccess("");
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!API) {
      setError("API URL is missing. Please check your frontend .env file.");
      return;
    }

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter an email address.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
     setError("No access token found. Please sign in again.");
     setSending(false);
    return;}

    setSending(true);

    try {
      const res = await fetch(`${API}/api/auth/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: cleanEmail,
          role,
        }),
      });

      // Some APIs return an empty body, so don't always assume JSON.
      const responseText = await res.text();
      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          if (res.ok) {
            throw new Error(
              "The API returned an unexpected response. Please verify the invitation status with your API provider."
            );
          }

          throw new Error(
            `The invitation request failed (HTTP ${res.status}).`
          );
        }
      }

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            `Could not send invitation (HTTP ${res.status}).`
        );
      }

      // A successful HTTP status alone does not prove that the
      // invitation was saved. The API must confirm its result.
      if (data.success !== true && !data.invitation && !data.data?.invitation) {
        setSuccess(
          "The API returned a successful HTTP status, but did not confirm that the invitation was saved. Please verify with your API provider."
        );
        return;
      }

      setSuccess(`Invitation sent to ${cleanEmail}`);

      setSent((list) => [
        {
          id: data.invitation?.id || data.data?.invitation?.id || Date.now(),
          email: cleanEmail,
          role,
          sentAt: new Date(),
        },
        ...list,
      ]);

      setEmail("");
    } catch (err) {
      setError(err.message || "Unable to send invitation. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-4 py-6 text-[#f1f5ff] sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Invitation</h1>
          <p className="mt-1 text-xs text-[#6b7396]">
            {sent.length} sent from this page
          </p>
        </div>

        <form
          onSubmit={sendInvite}
          className="mb-6 rounded-xl border border-[#1a2547] bg-[#0d1730] p-5 sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Invite a teammate</h2>
              <p className="mt-1 text-xs text-[#6b7396]">
                Only admins can send invitations and assign roles.
              </p>
            </div>
            <span className="rounded-full bg-[#16224a] px-3 py-1 text-[11px] font-semibold text-[#7aa2ff]">
              🔒 Admin only
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label
                htmlFor="invite-email"
                className="mb-2 block text-xs font-semibold text-[#9aa8d6]"
              >
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full rounded-lg border border-[#1a2547] bg-[#0a1020] px-4 py-3 text-sm text-[#f1f5ff] outline-none placeholder:text-[#4f6190] focus:border-[#4a7cff]"
              />
            </div>

            <div>
              <label
                htmlFor="invite-role"
                className="mb-2 block text-xs font-semibold text-[#9aa8d6]"
              >
                Assign role
              </label>
              <div className="relative">
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#1a2547] bg-[#0a1020] px-4 py-3 pr-10 text-sm text-[#f1f5ff] outline-none focus:border-[#4a7cff]"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9aa8d6"
                  strokeWidth="2"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-[#1a2547] px-4 py-2.5 text-sm font-medium text-[#aab4d4] transition hover:bg-[#0f1a35]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-[#4a7cff] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-[#1a2547] bg-[#0d1730]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#1a2547] text-[11px] font-semibold uppercase tracking-wider text-[#6b7396]">
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Sent</th>
                </tr>
              </thead>

              <tbody>
                {sent.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-[#4f6190]"
                    >
                      No invitations sent yet. Use the form above to invite your first teammate.
                    </td>
                  </tr>
                )}

                {sent.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[#1a2547] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: colorFor(inv.email) }}
                        >
                          {initials(inv.email)}
                        </span>
                        <span className="font-medium">
                          {inv.email.split("@")[0]}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-[#6b7396]">{inv.email}</td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                          roleBadge[inv.role] || roleBadge.EMPLOYEE
                        }`}
                      >
                        {inv.role === "ADMIN" ? "Admin" : "Employee"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-[#3a2a0a] px-2.5 py-1 text-[11px] font-semibold text-[#f5a623]">
                        Invited · pending
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[#6b7396]">
                      {formatTime(inv.sentAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
