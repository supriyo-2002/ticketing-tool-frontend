import { useEffect, useState } from "react";

// Change this to your backend URL
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

const badgeColor = {
  accepted: "text-emerald-400",
  pending: "text-amber-400",
  revoked: "text-rose-400",
  expired: "text-rose-400",
};

export default function InvitesPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [invites, setInvites] = useState([]);
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInvites = async () => {
    try {
      const res = await fetch(`${API}/invites`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Could not load invitations");
      setInvites(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const sendInvite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const res = await fetch(`${API}/invites`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not send invitation");
      setSuccess(`Invitation sent to ${email}`);
      setEmail("");
      loadInvites();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const resend = async (id) => {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/invites/${id}/resend`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Could not resend invitation");
      setSuccess("Invitation resent");
      loadInvites();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this invitation?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/invites/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Could not revoke invitation");
      setInvites((list) => list.filter((i) => i._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1020] px-4 py-6 text-[#f1f5ff] sm:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {/* New invitation */}
        <form
          onSubmit={sendInvite}
          className="rounded-2xl border border-[#1a2547] bg-[#0d1730] p-5 sm:rounded-3xl sm:p-8"
        >
          <h2 className="mb-5 text-xl font-semibold sm:text-2xl">
            New invitation
          </h2>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-400 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl border border-emerald-400 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-[#9aa8d6]">
                Work email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="employee@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#1a2547] bg-[#0f1a35] px-4 py-3.5 text-base text-[#f1f5ff] outline-none placeholder:text-[#4f6190] focus:border-[#4a7cff] sm:px-5 sm:py-4 sm:text-lg"
              />
            </div>

            <div className="flex flex-col gap-2 sm:w-56">
              <label htmlFor="role" className="font-semibold text-[#9aa8d6]">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-[#1a2547] bg-[#0f1a35] px-4 py-3.5 text-base text-[#f1f5ff] outline-none focus:border-[#4a7cff] sm:px-5 sm:py-4 sm:text-lg"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          <button
            disabled={sending}
            className="w-full rounded-2xl bg-[#4a7cff] py-3.5 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-lg"
          >
            {sending ? "Sending..." : "Send invitation"}
          </button>
        </form>

        {/* Invitations list */}
        <section className="rounded-2xl border border-[#1a2547] bg-[#0d1730] p-5 sm:rounded-3xl sm:p-8">
          <h2 className="mb-2 text-xl font-semibold sm:text-2xl">Invitations</h2>

          {invites.length === 0 && (
            <p className="pt-2 text-[#4f6190]">
              No invitations yet. Send your first one above.
            </p>
          )}

          <div className="divide-y divide-[#1a2547]">
            {invites.map((inv) => (
              <div
                key={inv._id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold sm:text-lg">
                    {inv.email}
                  </div>
                  <div className="mt-1 text-sm text-[#4f6190]">
                    {cap(inv.role)} · sent {formatDate(inv.createdAt)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap sm:gap-3">
                  <span
                    className={`rounded-full border border-[#1a2547] px-3 py-1 text-sm ${
                      badgeColor[inv.status] || "text-[#9aa8d6]"
                    }`}
                  >
                    {cap(inv.status)}
                  </span>

                  {inv.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={busyId === inv._id}
                        onClick={() => resend(inv._id)}
                        className="rounded-xl border border-[#1a2547] px-4 py-2 text-sm text-[#7aa2ff] transition hover:bg-[#0f1a35] disabled:opacity-50 sm:text-base"
                      >
                        Resend
                      </button>
                      <button
                        type="button"
                        disabled={busyId === inv._id}
                        onClick={() => revoke(inv._id)}
                        className="rounded-xl border border-[#1a2547] px-4 py-2 text-sm text-rose-400 transition hover:bg-[#0f1a35] disabled:opacity-50 sm:text-base"
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}