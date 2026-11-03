import { useCallback, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../utils/tokenStorage";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/+$/, "");

const INVITE_PATH = "/api/auth/invite";
// Set this to your "list invitations" endpoint from Postman (e.g. "/api/auth/invitations")
// to also show invitations sent earlier or from other devices. Leave null to show
// only the ones sent from this page.
const INVITES_LIST_PATH = "/api/auth/invitations";

const ROLES = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "ADMIN", label: "Admin" },
];

const roleBadge = {
  ADMIN: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  EMPLOYEE: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

const STATUSES = [
  {
    value: "Pending",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
    chip: "border-amber-500 bg-amber-500/15 text-amber-300",
  },
  {
    value: "Accepted",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    chip: "border-emerald-500 bg-emerald-500/15 text-emerald-300",
  },
  {
    value: "Expired",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
    chip: "border-rose-500 bg-rose-500/15 text-rose-300",
  },
];

const statusStyle = (value) =>
  STATUSES.find((s) => s.value === value) ?? STATUSES[0];

const normalizeStatus = (raw) => {
  const key = String(raw ?? "").toLowerCase();
  if (key.includes("accept")) return "Accepted";
  if (key.includes("expire") || key.includes("revoke") || key.includes("cancel"))
    return "Expired";
  return "Pending";
};

const DATE_RANGES = [
  { value: "all", label: "All time", days: null },
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "90", label: "Last 90 days", days: 90 },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "email", label: "Email A–Z" },
];

const avatarColors = ["#4a7cff", "#f5a623", "#2ecf8e", "#a78bfa", "#fb7185", "#38bdf8"];

const colorFor = (text = "") => {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return avatarColors[sum % avatarColors.length];
};

const initials = (email = "") => email.slice(0, 2).toUpperCase();

const formatTime = (d) => {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const findList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of Object.keys(value)) {
    const found = findList(value[key]);
    if (found.length) return found;
  }
  return [];
};

const toInvite = (raw) => {
  const expiresAt = raw.expires_at ?? null;
  let status = normalizeStatus(raw.status);

  // a pending invite whose date has passed counts as expired
  if (
    status === "Pending" &&
    expiresAt &&
    new Date(expiresAt).getTime() < Date.now()
  ) {
    status = "Expired";
  }

  return {
    id: raw.invite_id ?? raw.id ?? raw.email,
    email: raw.email ?? "",
    role: String(raw.role ?? "EMPLOYEE").toUpperCase(),
    status,
    sentAt: raw.created_at ?? null,
    expiresAt,
    acceptedAt: raw.accepted_at ?? null,
    resendCount: raw.resend_count ?? 0,
  };
};

const getToken = () =>
  tokenStorage.getAccessToken?.() ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

const currentRole = () =>
  String(
    tokenStorage.getUser?.()?.role ?? tokenStorage.getUser?.()?.user_role ?? ""
  ).toUpperCase();

/* ----- keep sent invitations in the browser until logout ----- */

const STORAGE_KEY = "relay_sent_invites";

const currentUserKey = () => {
  const u = tokenStorage.getUser?.();
  return String(u?.id ?? u?.email ?? "");
};

const loadStoredInvites = () => {
  try {
    // No token means the user is logged out, so drop any leftover data.
    if (!getToken()) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    // Only reuse the list if it belongs to the currently logged-in user.
    if (!saved || saved.user !== currentUserKey()) return [];
    return Array.isArray(saved.invites) ? saved.invites : [];
  } catch {
    return [];
  }
};

const inputClasses =
  "w-full rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30";
const selectClasses =
  "w-full appearance-none rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition focus:border-blue-500";
const labelClasses = "mb-2 block text-xs font-semibold text-slate-400";

function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#263653] bg-[#0b1427] p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#293752] text-sm text-slate-300 transition hover:bg-[#1a2942]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SelectBox({ id, label, value, onChange, options }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClasses}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
        ⌄
      </span>
    </div>
  );
}

export default function InvitesPage() {
  const isAdmin = useMemo(() => currentRole() === "ADMIN", []);

  // Start from what was saved, so a refresh keeps the list.
  const [invites, setInvites] = useState(loadStoredInvites);
  const [loading, setLoading] = useState(Boolean(INVITES_LIST_PATH));
  const [loadError, setLoadError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");

  /* ----- save invitations every time they change ----- */

  useEffect(() => {
    try {
      if (!getToken()) return; // logged out: don't save anything
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: currentUserKey(), invites })
      );
    } catch {
      /* storage full or blocked - ignore */
    }
  }, [invites]);

  /* ----- optional: load existing invitations ----- */

  const loadInvites = useCallback(async () => {
    if (!INVITES_LIST_PATH) return;
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${API}${INVITES_LIST_PATH}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(
          body.message || body.error || `Could not load invitations (HTTP ${res.status}).`
        );
      }
      const fetched = findList(body).map(toInvite).filter((i) => i.email);
      setInvites(fetched);
    } catch (err) {
      setLoadError(err.message || "Could not load invitations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  /* ----- send invitation ----- */

  const openForm = () => {
    setEmail("");
    setRole("EMPLOYEE");
    setFormError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError("");
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!API) {
      setFormError("API URL is missing. Please check your frontend .env file.");
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError("Please enter an email address.");
      return;
    }

    const token = getToken();
    if (!token) {
      setFormError("No access token found. Please sign in again.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`${API}${INVITE_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: cleanEmail, role }),
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
          throw new Error(`The invitation request failed (HTTP ${res.status}).`);
        }
      }

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || data.error || `Could not send invitation (HTTP ${res.status}).`
        );
      }

      // A successful HTTP status alone does not prove the invitation was saved.
      if (data.success !== true && !data.invitation && !data.data?.invitation) {
        setFormError(
          "The API returned a successful HTTP status, but did not confirm that the invitation was saved. Please verify with your API provider."
        );
        return;
      }

      setInvites((list) => [
        {
          id: data.invitation?.id || data.data?.invitation?.id || Date.now(),
          email: cleanEmail,
          role,
          status: "Pending",
          sentAt: new Date().toISOString(),
        },
        ...list,
      ]);

      setSuccess(`Invitation sent to ${cleanEmail}`);
      loadInvites();
      setShowForm(false);
      setEmail("");
    } catch (err) {
      setFormError(err.message || "Unable to send invitation. Please try again.");
    } finally {
      setSending(false);
    }
  };

  /* ----- filtering ----- */

  const query = search.trim().toLowerCase();

  const visibleInvites = useMemo(() => {
    const days = DATE_RANGES.find((r) => r.value === rangeFilter)?.days;
    const cutoff = days ? Date.now() - days * 86400000 : null;
    const time = (i) => (i.sentAt ? new Date(i.sentAt).getTime() : 0);

    const list = invites.filter((i) => {
      if (statusFilter !== "All" && i.status !== statusFilter) return false;
      if (roleFilter !== "all" && i.role !== roleFilter) return false;
      if (cutoff && time(i) < cutoff) return false;
      if (!query) return true;
      return `${i.email} ${i.role} ${i.status}`.toLowerCase().includes(query);
    });

    return [...list].sort((a, b) =>
      sortBy === "email"
        ? a.email.localeCompare(b.email)
        : sortBy === "oldest"
        ? time(a) - time(b)
        : time(b) - time(a)
    );
  }, [invites, statusFilter, roleFilter, rangeFilter, sortBy, query]);

  const filtersActive =
    statusFilter !== "All" || roleFilter !== "all" || rangeFilter !== "all" || query !== "";

  const clearFilters = () => {
    setStatusFilter("All");
    setRoleFilter("all");
    setRangeFilter("all");
    setSearch("");
  };

  /* ----- render ----- */

  return (
    <div className="min-w-0 w-full space-y-6 text-slate-100">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Invitation</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading
              ? "Loading invitations..."
              : `${invites.length} ${
                  invites.length === 1 ? "invitation" : "invitations"
                }${INVITES_LIST_PATH ? " across your organization" : " sent from this page"}`}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2160f5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span className="text-lg leading-none">+</span>
            Invite teammate
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          🔒 Only admins can send invitations and assign roles.
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {success}
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadInvites}
            className="rounded-lg border border-rose-400/40 px-3 py-1.5 font-semibold hover:bg-rose-500/10"
          >
            Try again
          </button>
        </div>
      )}

      {/* STATUS CHIPS */}
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter by status">
        {["All", ...STATUSES.map((s) => s.value)].map((value) => {
          const active = statusFilter === value;
          const color = active
            ? value === "All"
              ? "border-blue-500 bg-blue-500/15 text-blue-300"
              : statusStyle(value).chip
            : "border-[#243049] bg-[#0f1729] text-slate-300 hover:bg-[#16213a]";
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusFilter(value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${color}`}
            >
              {value !== "All" && (
                <span className={`h-2 w-2 rounded-full ${statusStyle(value).dot}`} />
              )}
              {value}
            </button>
          );
        })}
      </div>

      {/* DROPDOWN FILTERS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SelectBox
          id="filter-role"
          label="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[{ value: "all", label: "All roles" }, ...ROLES]}
        />
        <SelectBox
          id="filter-range"
          label="Filter by sent date"
          value={rangeFilter}
          onChange={setRangeFilter}
          options={DATE_RANGES}
        />
        <SelectBox
          id="filter-sort"
          label="Sort invitations"
          value={sortBy}
          onChange={setSortBy}
          options={SORTS}
        />
      </div>

      {/* SEARCH */}
      <div>
        <label htmlFor="invite-search" className="sr-only">
          Search invitations
        </label>
        <input
          id="invite-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invitations by email, role or status..."
          className="w-full rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      {/* INVITATION LIST */}
      <div className="overflow-hidden rounded-xl border border-[#202c46] bg-[#101a2e]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202c46] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">All invitations</h2>
            <p className="mt-1 text-xs text-slate-500">
              Track who you've invited and what role they'll get.
            </p>
          </div>
          <span className="rounded-lg border border-[#293752] px-3 py-2 text-xs text-slate-400">
            {visibleInvites.length} displayed
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
            <p className="text-sm text-slate-400">Loading invitations...</p>
          </div>
        ) : visibleInvites.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mb-3 text-3xl text-slate-500">✉</div>
            <h3 className="text-base font-semibold text-white">
              {invites.length === 0 ? "No invitations yet" : "No matching invitations"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {invites.length === 0
                ? isAdmin
                  ? "Invite your first teammate to get started."
                  : "An admin can invite the first teammate."
                : "Try a different search or clear your filters."}
            </p>
            {invites.length === 0 && isAdmin && (
              <button
                type="button"
                onClick={openForm}
                className="mt-5 rounded-lg bg-[#2160f5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                + Invite teammate
              </button>
            )}
            {invites.length > 0 && filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg border border-[#34435e] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-[#1a2942]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#202c46] text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Sent</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvites.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[#1a2640] transition last:border-0 hover:bg-[#121e35]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#08101e]"
                          style={{ backgroundColor: colorFor(inv.email) }}
                        >
                          {initials(inv.email)}
                        </span>
                        <span className="max-w-[180px] truncate font-semibold text-white">
                          {inv.email.split("@")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-slate-400">{inv.email}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                          roleBadge[inv.role] || roleBadge.EMPLOYEE
                        }`}
                      >
                        {inv.role === "ADMIN" ? "Admin" : "Employee"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                          statusStyle(inv.status).badge
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusStyle(inv.status).dot}`}
                        />
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                      {inv.sentAt ? formatTime(inv.sentAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVITE MODAL */}
      {showForm && isAdmin && (
        <Modal
          title="Invite a teammate"
          subtitle="They'll get an email with a link to join your organization."
          onClose={closeForm}
        >
          <form onSubmit={sendInvite} className="space-y-5">
            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
              >
                {formError}
              </p>
            )}

            <div>
              <label htmlFor="invite-email" className={labelClasses}>
                Email address *
              </label>
              <input
                id="invite-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError("");
                }}
                placeholder="teammate@company.com"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="invite-role" className={labelClasses}>
                Assign role
              </label>
              <div className="relative">
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={selectClasses}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ⌄
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#293752] pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-[#34435e] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-[#1a2942]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-[#2160f5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send invitation"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
