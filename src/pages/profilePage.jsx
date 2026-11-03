
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tokenStorage } from "../utils/tokenStorage";

const API = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const COLORS = ["#4a7cff", "#2ecf8e", "#f5a623", "#a78bfa", "#fb7185", "#38bdf8"];
const HIDDEN = /token|password|secret|session|hash|refresh/i;
const SHOWN = ["user_id", "id", "sub", "name", "full_name", "email", "role", "user_role", "organization_name", "organization", "org_name", "created_at", "createdAt"];

const colorFor = (t = "") => COLORS[[...t].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length];
const cap = (t = "") => t.replace(/[._-]+/g, " ").split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const initials = (n = "") => {
  const p = n.split(/\s+/).filter(Boolean);
  return (p.length > 1 ? p[0][0] + p[p.length - 1][0] : (p[0] || "U").slice(0, 2)).toUpperCase();
};
const fmt = (v) => {
  const d = v && new Date(v);
  return d && !isNaN(d) ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};
const text = (v) => (v == null || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));
const list = (v) => (Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v).map(list).find((a) => a.length) || [] : []);
const idOf = (m) => (typeof m === "string" ? m : m?.user_id ?? m?.id ?? m?.user?.id);

function getUser() {
  const u = tokenStorage.getUser() || {};
  const email = u.email ?? "";
  const role = String(u.role ?? u.user_role ?? "EMPLOYEE").toUpperCase();
  return {
    id: u.user_id ?? u.id ?? u.sub,
    email,
    name: cap(u.name ?? u.full_name ?? email.split("@")[0]) || "Your Account",
    admin: role === "ADMIN",
    org: u.organization_name ?? u.organization?.name ?? u.org_name ?? "",
    since: u.created_at ?? u.createdAt,
    extra: Object.entries(u).filter(([k]) => !SHOWN.includes(k) && !HIDDEN.test(k)).map(([k, v]) => [cap(k.replace(/([a-z])([A-Z])/g, "$1 $2")), text(v)]),
  };
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useMemo(getUser, []);
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    fetch(`${API}/api/projects`, { headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) } })
      .then(async (res) => {
        if (res.status === 401) return logout();
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `Could not load projects (HTTP ${res.status}).`);
        setProjects(list(body).map((p) => ({
          id: p.project_id ?? p.id,
          name: p.name ?? p.project_name ?? "Untitled project",
          desc: p.description ?? "",
          date: p.created_at ?? p.createdAt,
          members: list(p.members ?? p.project_members ?? p.member_ids),
        })));
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line
  }, []);

  const logout = () => {
    tokenStorage.clearSession();
    navigate("/", { replace: true });
  };

  const mine = (projects || []).filter((p) => p.members.some((m) => String(idOf(m)) === String(user.id)));
  const color = colorFor(user.email || user.name);
  const role = user.admin ? "Admin" : "Employee";

  const rows = [
    ["Full name", user.name],
    ["Email", user.email || "—"],
    ["Role", role],
    ["Organization", user.org || "—"],
    ["Member since", fmt(user.since)],
    ...user.extra,
  ];

  const copyId = () => navigator.clipboard?.writeText(String(user.id)).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });

  const card = "rounded-xl border border-[#202c46] bg-[#101a2e]";
  const head = "flex items-center justify-between gap-3 border-b border-[#202c46] px-5 py-3.5";

  return (
    <div className="w-full min-w-0 space-y-4 text-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Your account and activity in one place.</p>
      </div>

      {/* Header */}
      <div className={`${card} overflow-hidden`}>
        <div className="h-14" style={{ background: `linear-gradient(120deg, ${color}55, #101a2e 75%)` }} />
        <div className="flex flex-wrap items-center gap-4 px-5 pb-4">
          <span className="-mt-7 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-[#101a2e] text-xl font-bold text-[#08101e]" style={{ background: color }}>
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold text-white">{user.name}</h2>
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${user.admin ? "border-blue-500/30 bg-blue-500/10 text-blue-300" : "border-slate-500/30 bg-slate-500/10 text-slate-300"}`}>{role}</span>
            </div>
            <p className="truncate text-sm text-slate-400">{user.email}</p>
          </div>
          <button onClick={logout} className="rounded-lg border border-[#34435e] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-[#1a2942]">Log out</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Account details (highlighted) */}
        <section className="overflow-hidden rounded-xl border border-blue-500/50 bg-[#0f1c38] lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-[#1f3566] px-5 py-3.5">
            <div>
              <h2 className="text-base font-semibold text-blue-200">Account details</h2>
              <p className="text-xs text-slate-400">Read-only information</p>
            </div>
            <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-300">{role}</span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="min-w-0 border-b border-[#1f3566] px-5 py-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
                <dd className="mt-1 truncate text-sm font-medium text-white" title={v}>{v}</dd>
              </div>
            ))}
            <div className="min-w-0 px-5 py-3.5 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">User ID</dt>
              <dd className="mt-1 flex items-center gap-3">
                <span className="min-w-0 truncate font-mono text-xs text-slate-200">{text(user.id)}</span>
                {user.id && (
                  <button onClick={copyId} className="shrink-0 rounded-md border border-[#2f4f9e] px-2 py-1 text-[11px] text-blue-200 hover:bg-[#16295a]">{copied ? "Copied" : "Copy"}</button>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* Projects */}
        <section className={`${card} overflow-hidden`}>
          <div className={head}>
            <div>
              <h2 className="text-base font-semibold text-white">My projects{projects && !error ? ` · ${mine.length}` : ""}</h2>
              <p className="text-xs text-slate-500">Projects you're assigned to</p>
            </div>
            <Link to="/projects" className="rounded-lg border border-[#293752] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#1a2942]">View all</Link>
          </div>
          {error ? (
            <p className="px-5 py-8 text-center text-sm text-rose-300">{error}</p>
          ) : !projects ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Loading projects...</p>
          ) : !mine.length ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">{user.admin ? "No projects yet. Create one from the Projects page." : "You haven't been added to a project yet."}</p>
          ) : (
            mine.slice(0, 6).map((p) => (
              <div key={p.id ?? p.name} className="flex items-center gap-3 border-b border-[#1a2640] px-5 py-3 last:border-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-[#08101e]" style={{ background: colorFor(p.name) }}>{p.name[0].toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                  <p className="truncate text-xs text-slate-500">{p.members.length} {p.members.length === 1 ? "member" : "members"} · {fmt(p.date)}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
