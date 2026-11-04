import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tokenStorage } from "../utils/tokenStorage";

/* =========================
   API CONFIG
========================= */

// Base URL of the backend, read from .env (trailing slashes removed).
const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/+$/, "");

const PROJECTS_PATH = "/api/projects";
const EMPLOYEES_PATH = "/api/employees";

// OPTIONAL: if your backend has a "get current user / profile" endpoint
// (e.g. "/api/auth/me"), put its path here. The page will use it to fill in
// the organization name and "Member since". Leave null to skip it.
const PROFILE_PATH = null;

/* =========================
   HELPERS
========================= */

const COLORS = ["#4a7cff", "#2ecf8e", "#f5a623", "#a78bfa", "#fb7185", "#38bdf8"];

// Saved-user fields we never show (secrets).
const HIDDEN = /token|password|secret|session|hash|refresh/i;

// Fields that already have their own row, so they are left out of the "extra" rows.
const SHOWN = [
  "user_id", "id", "sub", "name", "full_name", "email", "role", "user_role",
  "organization_name", "organizationName", "organization", "org_name",
  "organization_id", "organizationId", "created_at", "createdAt",
];

// Same text always gets the same color.
const colorFor = (t = "") =>
  COLORS[[...t].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length];

// "john_doe" -> "John Doe"
const cap = (t = "") =>
  t
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

// "Supriyo Maity" -> "SM"
const initials = (n = "") => {
  const p = n.split(/\s+/).filter(Boolean);
  return (p.length > 1 ? p[0][0] + p[p.length - 1][0] : (p[0] || "U").slice(0, 2)).toUpperCase();
};

// Date -> "04 Nov 2026", or "—" if missing/invalid.
const fmt = (v) => {
  const d = v && new Date(v);
  return d && !isNaN(d)
    ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
};

// Any value -> readable text.
const text = (v) =>
  v == null || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);

// Finds the first non-empty array anywhere inside an API response.
const list = (v) =>
  Array.isArray(v)
    ? v
    : v && typeof v === "object"
    ? Object.values(v).map(list).find((a) => a.length) || []
    : [];

// Id of a project member (they can be strings or objects).
const idOf = (m) => (typeof m === "string" ? m : m?.user_id ?? m?.id ?? m?.user?.id);

// Organization name, looking in every shape the API might use.
const orgNameOf = (o = {}) =>
  o.organization_name ??
  o.organizationName ??
  o.organization?.name ??
  o.organization?.organization_name ??
  o.organizations?.name ??
  o.org_name ??
  "";

// "Member since" date, looking in every shape the API might use.
const sinceOf = (o = {}) =>
  o.created_at ??
  o.createdAt ??
  o.user?.created_at ??
  o.profile?.created_at ??
  o.joined_at ??
  o.joinedAt ??
  null;

// Reads the user saved at login.
function getStoredUser() {
  const u = tokenStorage.getUser() || {};
  const email = u.email ?? "";
  const role = String(u.role ?? u.user_role ?? "EMPLOYEE").toUpperCase();

  return {
    id: u.user_id ?? u.id ?? u.sub,
    email,
    name: cap(u.name ?? u.full_name ?? email.split("@")[0]) || "Your Account",
    admin: role === "ADMIN",
    org: orgNameOf(u),
    orgId: u.organization_id ?? u.organizationId ?? "",
    since: sinceOf(u),
    // Anything else in the saved user (except secrets) is listed as an extra row.
    extra: Object.entries(u)
      .filter(([k]) => !SHOWN.includes(k) && !HIDDEN.test(k))
      .map(([k, v]) => [cap(k.replace(/([a-z])([A-Z])/g, "$1 $2")), text(v)]),
  };
}

// GET helper: adds the token and throws an Error with a readable message.
// err.status === 401 means the session expired.
async function apiGet(path) {
  const token = tokenStorage.getAccessToken();
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    const err = new Error("Session expired. Please sign in again.");
    err.status = 401;
    throw err;
  }

  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request failed (HTTP ${res.status}).`);
  }

  return body;
}

/* =========================
   PAGE
========================= */

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useMemo(getStoredUser, []);

  const [projects, setProjects] = useState(null); // null = still loading
  const [error, setError] = useState("");
  // Organization name and join date found outside the saved login data.
  const [extras, setExtras] = useState({ org: "", since: null });
  const [copied, setCopied] = useState(""); // label of the ID that was just copied

  const logout = useCallback(() => {
    tokenStorage.clearSession();
    navigate("/", { replace: true });
  }, [navigate]);

  // Fills in the organization / date only if we don't have them yet.
  const addExtras = useCallback(
    (found) =>
      setExtras((prev) => ({
        org: prev.org || found.org || "",
        since: prev.since || found.since || null,
      })),
    []
  );

  useEffect(() => {
    // Extra lookups are best effort: only an expired session matters.
    const onExtraError = (e) => {
      if (e.status === 401) logout();
    };

    // 1) Projects (shown in the "My projects" card).
    apiGet(PROJECTS_PATH)
      .then((body) => {
        const raw = list(body);

        // Some APIs include the organization name on each project.
        const orgFromProjects = raw.map(orgNameOf).find(Boolean);
        if (orgFromProjects) addExtras({ org: orgFromProjects });

        setProjects(
          raw.map((p) => ({
            id: p.project_id ?? p.id,
            name: p.name ?? p.project_name ?? "Untitled project",
            date: p.created_at ?? p.createdAt,
            members: list(p.members ?? p.project_members ?? p.member_ids),
          }))
        );
      })
      .catch((e) => {
        if (e.status === 401) return logout();
        setError(e.message);
      });

    // 2) The current user's own profile, if an endpoint is configured above.
    if (PROFILE_PATH) {
      apiGet(PROFILE_PATH)
        .then((body) => {
          const raw = body.data?.user ?? body.data ?? body.user ?? body;
          addExtras({ org: orgNameOf(raw), since: sinceOf(raw) });
        })
        .catch(onExtraError);
    }

    // 3) The employees list: find this user's record (it may hold the join date).
    apiGet(EMPLOYEES_PATH)
      .then((body) => {
        const mine = list(body).find(
          (e) =>
            String(e.user_id ?? e.id ?? e.profile_id ?? e.user?.id) === String(user.id) ||
            (user.email &&
              String(e.email ?? e.user?.email ?? "").toLowerCase() ===
                user.email.toLowerCase())
        );
        if (mine) addExtras({ org: orgNameOf(mine), since: sinceOf(mine) });
      })
      .catch(onExtraError);
  }, [user.id, user.email, logout, addExtras]);

  // Projects this user belongs to.
  const mine = (projects || []).filter((p) =>
    p.members.some((m) => String(idOf(m)) === String(user.id))
  );

  const color = colorFor(user.email || user.name);
  const role = user.admin ? "Admin" : "Employee";

  // Saved login data first, then whatever the extra lookups found.
  const org = user.org || extras.org;
  const since = user.since || extras.since;

  const rows = [
    ["Full name", user.name],
    ["Email", user.email || "—"],
    ["Role", role],
    ["Organization", org || "—"],
    ["Member since", fmt(since)],
    ...user.extra,
  ];

  // IDs get their own block with a copy button each.
  const ids = [
    ["Organization ID", user.orgId],
    ["User ID", user.id],
  ].filter(([, value]) => value);

  const copyId = (label, value) =>
    navigator.clipboard?.writeText(String(value)).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    });

  const card = "rounded-xl border border-[#202c46] bg-[#101a2e]";
  const head =
    "flex items-center justify-between gap-3 border-b border-[#202c46] px-4 py-3.5 sm:px-5";

  return (
    <div className="w-full min-w-0 space-y-4 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Your account and activity in one place.
        </p>
      </div>

      {/* Header: avatar, name, role and log out (stacks on phones) */}
      <div className={`${card} overflow-hidden`}>
        <div
          className="h-14"
          style={{ background: `linear-gradient(120deg, ${color}55, #101a2e 75%)` }}
        />
        <div className="flex flex-wrap items-center gap-4 px-4 pb-4 sm:px-5">
          <span
            className="-mt-7 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-[#101a2e] text-xl font-bold text-[#08101e]"
            style={{ background: color }}
          >
            {initials(user.name)}
          </span>

          <div className="min-w-0 flex-1 basis-48 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold text-white">{user.name}</h2>
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                  user.admin
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                    : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                }`}
              >
                {role}
              </span>
            </div>
            <p className="truncate text-sm text-slate-400">{user.email}</p>
            {org && <p className="truncate text-xs text-slate-500">{org}</p>}
          </div>

          <button
            onClick={logout}
            className="w-full rounded-lg border border-[#34435e] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-[#1a2942] sm:w-auto"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Account details (left, wider) and projects (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="overflow-hidden rounded-xl border border-blue-500/50 bg-[#0f1c38] lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-[#1f3566] px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-blue-200">Account details</h2>
              <p className="text-xs text-slate-400">Read-only information</p>
            </div>
            <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-300">
              {role}
            </span>
          </div>

          {/* One column on phones, two from sm up */}
          <dl className="grid grid-cols-1 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="min-w-0 border-b border-[#1f3566] px-4 py-3.5 sm:px-5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {k}
                </dt>
                <dd className="mt-1 truncate text-sm font-medium text-white" title={v}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          {/* IDs: long values wrap instead of overflowing */}
          {ids.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {ids.map(([label, value]) => (
                <div key={label} className="min-w-0 px-4 py-3.5 sm:px-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <div className="mt-1 flex items-start gap-3">
                    <span className="min-w-0 flex-1 break-all font-mono text-xs text-slate-200">
                      {text(value)}
                    </span>
                    <button
                      onClick={() => copyId(label, value)}
                      className="shrink-0 rounded-md border border-[#2f4f9e] px-2 py-1 text-[11px] text-blue-200 hover:bg-[#16295a]"
                    >
                      {copied === label ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Projects this user belongs to */}
        <section className={`${card} overflow-hidden`}>
          <div className={head}>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white">
                My projects{projects && !error ? ` · ${mine.length}` : ""}
              </h2>
              <p className="text-xs text-slate-500">Projects you're assigned to</p>
            </div>
            <Link
              to="/projects"
              className="shrink-0 rounded-lg border border-[#293752] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#1a2942]"
            >
              View all
            </Link>
          </div>

          {error ? (
            <p className="px-5 py-8 text-center text-sm text-rose-300">{error}</p>
          ) : !projects ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              Loading projects...
            </p>
          ) : !mine.length ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              {user.admin
                ? "No projects yet. Create one from the Projects page."
                : "You haven't been added to a project yet."}
            </p>
          ) : (
            mine.slice(0, 6).map((p) => (
              <div
                key={p.id ?? p.name}
                className="flex items-center gap-3 border-b border-[#1a2640] px-4 py-3 last:border-0 sm:px-5"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-[#08101e]"
                  style={{ background: colorFor(p.name) }}
                >
                  {p.name[0].toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {p.members.length} {p.members.length === 1 ? "member" : "members"} ·{" "}
                    {fmt(p.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
