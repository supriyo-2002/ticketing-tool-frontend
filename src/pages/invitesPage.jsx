import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "../utils/tokenStorage";

/* =========================
   API CONFIG
   Match these paths/methods to your Postman collection.
========================= */

// Base URL of the backend, read from .env (trailing slashes removed).
const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/+$/, "");

const INVITE_PATH = "/api/auth/invite"; // POST   send a new invitation
const INVITES_LIST_PATH = "/api/auth/invitations"; // GET    list all invitations

// One invitation: GET (view) and DELETE (remove) use this path.
// NOTE: this one is a guess. Replace it if your Postman collection has a different path.
const inviteItemPath = (id) => `${INVITES_LIST_PATH}/${encodeURIComponent(id)}`;

// Resend the invitation email: POST /api/auth/resend-invite/:inviteId
// (same as {{baseUrl}}/api/auth/resend-invite/:inviteId in Postman)
const resendPath = (id) => `/api/auth/resend-invite/${encodeURIComponent(id)}`;
const RESEND_METHOD = "POST";

/* =========================
   STATIC OPTIONS
========================= */

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

// Maps whatever the API calls a status onto Pending / Accepted / Expired.
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

/* =========================
   HELPERS
========================= */

const avatarColors = ["#4a7cff", "#f5a623", "#2ecf8e", "#a78bfa", "#fb7185", "#38bdf8"];

// Same email always gets the same avatar color.
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

// "Expires in 3 days" / "Expired 2 days ago" (empty for accepted invitations).
const expiryNote = (invite) => {
  if (invite.status === "Accepted" || !invite.expiresAt) return "";
  const diff = new Date(invite.expiresAt).getTime() - Date.now();
  if (Number.isNaN(diff)) return "";
  const days = Math.ceil(Math.abs(diff) / 86400000);
  if (diff >= 0) return days <= 1 ? "Expires today" : `Expires in ${days} days`;
  return `Expired ${days} ${days === 1 ? "day" : "days"} ago`;
};

// Finds the first non-empty array anywhere inside an API response.
const findList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of Object.keys(value)) {
    const found = findList(value[key]);
    if (found.length) return found;
  }
  return [];
};

// Converts one invitation from the API into the shape this page uses.
const toInvite = (raw) => {
  const expiresAt = raw.expires_at ?? null;
  let status = normalizeStatus(raw.status);

  // A pending invitation whose date has passed counts as expired.
  if (
    status === "Pending" &&
    expiresAt &&
    new Date(expiresAt).getTime() < Date.now()
  ) {
    status = "Expired";
  }

  return {
    // The real invitation id is what /resend-invite/:inviteId needs.
    id: raw.invite_id ?? raw.invitation_id ?? raw.id ?? raw.email,
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

// Builds a readable error from the API body. It includes the extra reason the
// backend sends (for example the real Supabase error) instead of hiding it.
const apiMessage = (data, status) => {
  const main =
    data.message ||
    (typeof data.error === "string" ? data.error : data.error?.message) ||
    `The request failed (HTTP ${status}).`;

  const detail = [
    typeof data.error === "string" ? data.error : data.error?.message,
    data.details,
    data.detail,
    data.reason,
    data.supabase_error,
    data.supabaseError,
  ].find((v) => typeof v === "string" && v && v !== main);

  return detail ? `${main} (${detail})` : main;
};

// One place for every API call: adds the token, reads the JSON safely and
// throws an Error with a readable message. err.status === 401 means the
// session expired. The full response is also printed in the browser console.
async function request(path, { method = "GET", body } = {}) {
  if (!API) {
    throw new Error("API URL is missing. Please check your frontend .env file.");
  }

  const token = getToken();
  if (!token) {
    const err = new Error("No access token found. Please sign in again.");
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Some APIs (e.g. DELETE) return an empty body, so don't always assume JSON.
  const text = await res.text();
  let data = {};
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        const err = new Error(`The request failed (HTTP ${res.status}).`);
        err.status = res.status;
        throw err;
      }
    }
  }

  if (res.status === 401) {
    const err = new Error("Session expired. Please sign in again.");
    err.status = 401;
    throw err;
  }

  if (!res.ok || data.success === false) {
    console.error(`[API] ${method} ${path} -> HTTP ${res.status}`, data);
    const err = new Error(apiMessage(data, res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const inputClasses =
  "w-full rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30";
const selectClasses =
  "w-full appearance-none rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition focus:border-blue-500";
const labelClasses = "mb-2 block text-xs font-semibold text-slate-400";

/* =========================
   SMALL COMPONENTS
========================= */

// Icons for the action buttons.
function ActionIcon({ type, size = 16 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "view") {
    return (
      <svg {...common}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (type === "resend") {
    return (
      <svg {...common}>
        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
        <path d="M21 3v5h-5M3 21v-5h5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

// One action button. Icon-only in the table, icon + text on mobile cards.
function ActionButton({ type, label, onClick, disabled, busy, danger, showLabel }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#293752] text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        showLabel ? "flex-1 px-3" : "w-9"
      } ${
        danger
          ? "text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/10"
          : "text-slate-300 hover:border-blue-500/50 hover:bg-[#1a2942]"
      }`}
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
      ) : (
        <ActionIcon type={type} />
      )}
      {showLabel && label}
    </button>
  );
}

// Role pill (Admin / Employee).
function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${
        roleBadge[role] || roleBadge.EMPLOYEE
      }`}
    >
      {role === "ADMIN" ? "Admin" : "Employee"}
    </span>
  );
}

// Status pill (Pending / Accepted / Expired).
function StatusPill({ status }) {
  const style = statusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

// Round avatar with the first two letters of the email.
function Avatar({ email }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#08101e]"
      style={{ backgroundColor: colorFor(email) }}
    >
      {initials(email)}
    </span>
  );
}

// Popup shell: bottom sheet on phones, centered dialog on larger screens.
// Closes on Escape or when the dark background is clicked.
function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-[#263653] bg-[#0b1427] p-5 shadow-2xl sm:rounded-xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#293752] text-sm text-slate-300 transition hover:bg-[#1a2942]"
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

// Label + value pair for the details popup.
function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="break-words text-sm text-slate-200">{children}</div>
    </div>
  );
}

/* =========================
   PAGE
========================= */

export default function InvitesPage() {
  const navigate = useNavigate();
  const isAdmin = useMemo(() => currentRole() === "ADMIN", []);

  // ----- data -----
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(isAdmin);
  const [loadError, setLoadError] = useState("");

  // ----- "invite a teammate" form -----
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  // ----- messages and popups -----
  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  // Open popup: { type: "view" | "delete", id } or null.
  const [modal, setModal] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  // Which row is running resend/delete right now.
  const [busy, setBusy] = useState({ id: null, action: "" });

  // ----- filters -----
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");

  // Session expired: clear the login and go back to the sign-in page.
  const handleExpired = useCallback(() => {
    tokenStorage.clearSession?.();
    navigate("/", { replace: true });
  }, [navigate]);

  // Success message hides itself after 5 seconds.
  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(""), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  /* ----- load invitations (GET list) ----- */

  // silent = refresh the list without showing the big loading spinner.
  const loadInvites = useCallback(
    async ({ silent = false } = {}) => {
      if (!isAdmin) return; // the API only lets admins see invitation history
      if (!silent) setLoading(true);
      setLoadError("");
      try {
        const body = await request(INVITES_LIST_PATH);
        setInvites(findList(body).map(toInvite).filter((i) => i.email));
      } catch (err) {
        if (err.status === 401) return handleExpired();
        setLoadError(err.message || "Could not load invitations.");
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, handleExpired]
  );

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  /* ----- send a new invitation (POST) ----- */

  const openForm = () => {
    setEmail("");
    setRole("EMPLOYEE");
    setFormError("");
    setSuccess("");
    setActionError("");
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

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError("Please enter an email address.");
      return;
    }

    setSending(true);

    try {
      const data = await request(INVITE_PATH, {
        method: "POST",
        body: { email: cleanEmail, role },
      });

      // A successful HTTP status alone does not prove the invitation was saved.
      if (data.success !== true && !data.invitation && !data.data?.invitation) {
        throw new Error(
          "The API returned a successful HTTP status, but did not confirm that the invitation was saved. Please verify with your API provider."
        );
      }

      setSuccess(`Invitation sent to ${cleanEmail}`);
      setShowForm(false);
      setEmail("");
      await loadInvites({ silent: true }); // the server list is the source of truth
    } catch (err) {
      if (err.status === 401) return handleExpired();
      setFormError(err.message || "Unable to send invitation. Please try again.");
    } finally {
      setSending(false);
    }
  };

  /* ----- view one invitation ----- */

  const closeModal = useCallback(() => {
    setModal(null);
    setActionError("");
  }, []);

  // Shows the popup right away with the list data, then tries to refresh it
  // from GET /invitations/:id. If that call fails the list data stays.
  const openView = async (invite) => {
    setActionError("");
    setSuccess("");
    setModal({ type: "view", id: invite.id });
    setViewLoading(true);
    try {
      const body = await request(inviteItemPath(invite.id));
      const raw = body.data?.invitation ?? body.data ?? body.invitation ?? body;
      if (raw && raw.email) {
        const fresh = toInvite(raw);
        setInvites((list) =>
          list.map((i) => (i.id === invite.id ? { ...i, ...fresh, id: i.id } : i))
        );
      }
    } catch (err) {
      if (err.status === 401) handleExpired();
    } finally {
      setViewLoading(false);
    }
  };

  /* ----- resend the email (POST /api/auth/resend-invite/:inviteId) ----- */

  const resendInvite = async (invite) => {
    if (!isAdmin || busy.id) return;
    setSuccess("");
    setActionError("");

    // If the list had no real invitation id, the id is just the email and the
    // API would answer "Invitation not found". Stop early with a clear message.
    if (!invite.id || String(invite.id).includes("@")) {
      setActionError(
        "This invitation has no ID in the API response, so it can't be resent. Check that GET /api/auth/invitations returns invite_id."
      );
      return;
    }

    setBusy({ id: invite.id, action: "resend" });
    try {
      const data = await request(resendPath(invite.id), { method: RESEND_METHOD });
      setModal(null);
      setSuccess(data.message || `Invitation resent to ${invite.email}.`);
      await loadInvites({ silent: true }); // picks up the new expiry and resend count
    } catch (err) {
      if (err.status === 401) return handleExpired();

      // Friendly text for the cases the API documents.
      const msg =
        /already been registered/i.test(err.message)
          ? `${invite.email} already has an account, so the invite email can't be re-sent. Ask them to sign in, or use "Forgot password" to set a password.`
          : err.status === 429
          ? `Please wait a bit before resending again. ${err.message}`
          : err.status === 404
          ? "Invitation not found. Refresh the list and try again."
          : err.message || "Could not resend the invitation.";
      setActionError(msg);
    } finally {
      setBusy({ id: null, action: "" });
    }
  };

  /* ----- delete (DELETE) ----- */

  const openDelete = (invite) => {
    setActionError("");
    setSuccess("");
    setModal({ type: "delete", id: invite.id });
  };

  const confirmDelete = async (invite) => {
    if (!isAdmin || busy.id) return;
    setActionError("");
    setBusy({ id: invite.id, action: "delete" });
    try {
      const data = await request(inviteItemPath(invite.id), { method: "DELETE" });
      setInvites((list) => list.filter((i) => i.id !== invite.id));
      setModal(null);
      setSuccess(data.message || `Invitation for ${invite.email} deleted.`);
      await loadInvites({ silent: true });
    } catch (err) {
      if (err.status === 401) return handleExpired();
      setActionError(err.message || "Could not delete the invitation.");
    } finally {
      setBusy({ id: null, action: "" });
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

  // Numbers shown on the status chips.
  const counts = useMemo(() => {
    const result = { All: invites.length };
    STATUSES.forEach((s) => (result[s.value] = 0));
    invites.forEach((i) => {
      result[i.status] += 1;
    });
    return result;
  }, [invites]);

  const filtersActive =
    statusFilter !== "All" || roleFilter !== "all" || rangeFilter !== "all" || query !== "";

  const clearFilters = () => {
    setStatusFilter("All");
    setRoleFilter("all");
    setRangeFilter("all");
    setSearch("");
  };

  // The invitation shown in the open popup (looked up so it stays up to date).
  const selected = modal ? invites.find((i) => i.id === modal.id) : null;
  const anyBusy = busy.id !== null;

  // Buttons for one row. Used by both the table and the mobile cards.
  const rowActions = (invite, showLabel) => (
    <>
      <ActionButton
        type="view"
        label="View"
        showLabel={showLabel}
        onClick={() => openView(invite)}
      />
      {isAdmin && (
        <>
          <ActionButton
            type="resend"
            label="Resend"
            showLabel={showLabel}
            busy={busy.id === invite.id && busy.action === "resend"}
            disabled={anyBusy || invite.status === "Accepted"}
            onClick={() => resendInvite(invite)}
          />
          <ActionButton
            type="delete"
            label="Delete"
            showLabel={showLabel}
            danger
            disabled={anyBusy}
            onClick={() => openDelete(invite)}
          />
        </>
      )}
    </>
  );

  /* ----- render ----- */

  return (
    <div className="min-w-0 w-full space-y-6 text-slate-100">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Invitation
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading
              ? "Loading invitations..."
              : `${invites.length} ${
                  invites.length === 1 ? "invitation" : "invitations"
                } across your organization`}
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
          🔒 Only admins can view, send, resend and delete invitations.
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

      {/* Errors from resend/delete; hidden while a popup is open (it shows its own) */}
      {actionError && !modal && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss"
            className="shrink-0 text-rose-200 hover:text-white"
          >
            ✕
          </button>
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
            onClick={() => loadInvites()}
            className="rounded-lg border border-rose-400/40 px-3 py-1.5 font-semibold hover:bg-rose-500/10"
          >
            Try again
          </button>
        </div>
      )}

      {/* STATUS CHIPS (scroll sideways on narrow screens) */}
      <div
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label="Filter by status"
      >
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
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${color}`}
            >
              {value !== "All" && (
                <span className={`h-2 w-2 rounded-full ${statusStyle(value).dot}`} />
              )}
              {value}
              <span className="text-xs opacity-70">{counts[value]}</span>
            </button>
          );
        })}
      </div>

      {/* DROPDOWN FILTERS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202c46] px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-lg font-semibold text-white">All invitations</h2>
            <p className="mt-1 text-xs text-slate-500">
              View, resend or delete the invitations you've sent.
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
                  : "Only admins can see the invitation history."
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
          <>
            {/* MOBILE: one card per invitation (hidden on md and up) */}
            <div className="divide-y divide-[#1a2640] md:hidden">
              {visibleInvites.map((inv) => (
                <article key={inv.id} className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar email={inv.email} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {inv.email.split("@")[0]}
                      </p>
                      <p className="truncate text-xs text-slate-400">{inv.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <RoleBadge role={inv.role} />
                    <StatusPill status={inv.status} />
                  </div>

                  <div className="text-xs text-slate-500">
                    <p>Sent {inv.sentAt ? formatTime(inv.sentAt) : "—"}</p>
                    {expiryNote(inv) && <p className="mt-0.5">{expiryNote(inv)}</p>}
                    {inv.resendCount > 0 && (
                      <p className="mt-0.5">Resent {inv.resendCount}×</p>
                    )}
                  </div>

                  <div className="flex gap-2">{rowActions(inv, true)}</div>
                </article>
              ))}
            </div>

            {/* DESKTOP: table (hidden below md) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#202c46] text-xs font-semibold text-slate-500">
                    <th className="px-5 py-3 font-semibold">Member</th>
                    <th className="px-3 py-3 font-semibold">Email</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Sent</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
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
                          <Avatar email={inv.email} />
                          <span className="max-w-[160px] truncate font-semibold text-white">
                            {inv.email.split("@")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-4 text-slate-400">
                        {inv.email}
                      </td>
                      <td className="px-3 py-4">
                        <RoleBadge role={inv.role} />
                      </td>
                      <td className="px-3 py-4">
                        <StatusPill status={inv.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
                        <p>{inv.sentAt ? formatTime(inv.sentAt) : "—"}</p>
                        {inv.resendCount > 0 && (
                          <p className="mt-0.5 text-[11px] text-slate-600">
                            Resent {inv.resendCount}×
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">{rowActions(inv, false)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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

            <div className="flex flex-col-reverse gap-3 border-t border-[#293752] pt-5 sm:flex-row sm:justify-end">
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

      {/* VIEW POPUP */}
      {modal?.type === "view" && selected && (
        <Modal
          title={selected.email}
          subtitle="Invitation details"
          onClose={closeModal}
        >
          {viewLoading && (
            <p className="mb-3 text-xs text-slate-400">Refreshing details...</p>
          )}
          {actionError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
            >
              {actionError}
            </p>
          )}

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <RoleBadge role={selected.role} />
            <StatusPill status={selected.status} />
            {expiryNote(selected) && (
              <span className="text-xs text-slate-500">{expiryNote(selected)}</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 rounded-xl border border-[#26344e] bg-[#101a2e] p-4 sm:grid-cols-2">
            <Field label="Email">{selected.email}</Field>
            <Field label="Role">{selected.role === "ADMIN" ? "Admin" : "Employee"}</Field>
            <Field label="Sent">{selected.sentAt ? formatTime(selected.sentAt) : "—"}</Field>
            <Field label="Expires">
              {selected.expiresAt ? formatTime(selected.expiresAt) : "—"}
            </Field>
            <Field label="Accepted">
              {selected.acceptedAt ? formatTime(selected.acceptedAt) : "Not yet"}
            </Field>
            <Field label="Times resent">{selected.resendCount}</Field>
            <div className="sm:col-span-2">
              <Field label="Invitation ID">
                <span className="font-mono text-xs text-slate-400">{String(selected.id)}</span>
              </Field>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#293752] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-[#34435e] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-[#1a2942]"
            >
              Close
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => openDelete(selected)}
                  disabled={anyBusy}
                  className="rounded-lg border border-rose-500/40 px-5 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                >
                  Delete
                </button>
                {selected.status !== "Accepted" && (
                  <button
                    type="button"
                    onClick={() => resendInvite(selected)}
                    disabled={anyBusy}
                    className="rounded-lg bg-[#2160f5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy.id === selected.id && busy.action === "resend"
                      ? "Resending..."
                      : "Resend invitation"}
                  </button>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {modal?.type === "delete" && selected && isAdmin && (
        <Modal
          title="Delete invitation?"
          subtitle="This can't be undone."
          onClose={closeModal}
        >
          <p className="text-sm text-slate-300">
            The invitation for{" "}
            <span className="font-semibold text-white">{selected.email}</span> will be
            deleted. If it hasn't been accepted, the link in their email will stop working.
          </p>

          {actionError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
            >
              {actionError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-[#34435e] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-[#1a2942]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmDelete(selected)}
              disabled={anyBusy}
              className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy.id === selected.id && busy.action === "delete"
                ? "Deleting..."
                : "Delete invitation"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
