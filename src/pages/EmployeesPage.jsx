import { useCallback, useEffect, useMemo, useState } from "react";
import { getEmployees } from "../api/employees";
// ======================================
// CONFIG
// ======================================
// Where your login code saves the logged-in user (used to stop an admin
// from deactivating themselves). Adjust if your project uses another key.
const USER_KEY = "user";

const roleStyles = {
  ADMIN: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  SUPPORT_LEAD: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  EMPLOYEE: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

const formatRole = (role = "") =>
  role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user_id || parsed?.user?.user_id || "";
  } catch {
    return "";
  }
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [busyId, setBusyId] = useState("");

  const currentUserId = getCurrentUserId();

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getEmployees();
      setEmployees(list);
    } catch (err) {
      console.error("Load employees error:", err);
      setError(
        err.status === 403
          ? "Only admins can view employees."
          : err.message || "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const isActive = (e) => String(e.account_status).toUpperCase() === "ACTIVE";

  const stats = useMemo(() => {
    const active = employees.filter(isActive).length;
    return {
      total: employees.length,
      active,
      deactivated: employees.length - active,
    };
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        !q ||
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || e.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? isActive(e) : !isActive(e));
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  const roleOptions = useMemo(
    () => [...new Set(employees.map((e) => e.role).filter(Boolean))],
    [employees]
  );

  const handleConfirmDeactivate = async () => {
     setConfirmTarget(null);
  setError(
    "Employee deactivation is not connected yet. Please provide the deactivation API."
  );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 text-[#f3f5fb]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="mt-1 text-xs text-[#8a94b8]">
            People in your organization. Admins can deactivate access when
            someone leaves.
          </p>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
          🔒 Admin only
        </span>
      </div>

      {/* Banners */}
      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-[#087d68] bg-[#0b2b32] px-4 py-3 text-sm text-[#34ebc1]"
        >
          {success}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadEmployees}
            className="shrink-0 rounded-md border border-red-500/30 px-3 py-1 text-xs font-semibold hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          ["Total", stats.total, "text-[#f3f5fb]"],
          ["Active", stats.active, "text-emerald-300"],
          ["Deactivated", stats.deactivated, "text-red-300"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-[#1d2545] bg-[#0d1326] px-4 py-3"
          >
            <div className="text-[11px] text-[#6b7396]">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#1d2545] bg-[#0d1326] p-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="flex-1 rounded-lg border border-[#2a3358] bg-[#161d33] px-3.5 py-2.5 text-sm text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-[#2a3358] bg-[#161d33] px-3 py-2.5 text-sm text-[#f3f5fb] outline-none focus:border-[#5b6ef5]"
        >
          <option value="ALL">All roles</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {formatRole(r)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#2a3358] bg-[#161d33] px-3 py-2.5 text-sm text-[#f3f5fb] outline-none focus:border-[#5b6ef5]"
        >
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#1d2545] bg-[#0d1326]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#1d2545] text-[11px] uppercase tracking-wider text-[#6b7396]">
                <th className="px-5 py-3.5 font-semibold">Member</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8a94b8]">
                    Loading employees...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8a94b8]">
                    {employees.length === 0
                      ? "No employees found in your organization."
                      : "No employees match your filters."}
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((e) => {
                  const active = isActive(e);
                  const isSelf = e.user_id === currentUserId;
                  return (
                    <tr
                      key={e.user_id}
                      className="border-b border-[#1d2545] last:border-b-0 hover:bg-[#111830]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-[11px] font-bold text-white">
                            {initials(e.name)}
                          </div>
                          <span className="font-semibold">
                            {e.name || "-"}
                            {isSelf && (
                              <span className="ml-2 text-[10px] font-medium text-[#6b7396]">
                                (you)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#aab4d4]">{e.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${
                            roleStyles[e.role] || roleStyles.EMPLOYEE
                          }`}
                        >
                          {formatRole(e.role)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            active
                              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                              : "border-red-500/30 bg-red-500/15 text-red-300"
                          }`}
                        >
                          {active ? "Active" : "Deactivated"}
                        </span>
                        {!active && e.deactivated_at && (
                          <div className="mt-1 text-[10px] text-[#6b7396]">
                            since {formatDate(e.deactivated_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#8a94b8]">
                        {formatDate(e.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {active && !isSelf ? (
                          <button
                            type="button"
                            disabled={busyId === e.user_id}
                            onClick={() => setConfirmTarget(e)}
                            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {busyId === e.user_id ? "Working..." : "Deactivate"}
                          </button>
                        ) : (
                          <span className="text-xs text-[#6b7396]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-[#6b7396]">
        Showing {filtered.length} of {employees.length} employees
      </p>

      {/* Confirm modal */}
      {confirmTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#1d2545] bg-[#111827] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-xl">
              ⚠️
            </div>
            <h3 className="mb-2 text-lg font-bold">Deactivate employee?</h3>
            <p className="text-sm leading-relaxed text-[#aab4d4]">
              <span className="font-semibold text-white">
                {confirmTarget.name || confirmTarget.email}
              </span>{" "}
              will no longer be able to sign in or use the application.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={busyId === confirmTarget.user_id}
                className="flex-1 rounded-lg border border-[#2a3358] py-2.5 text-sm font-semibold transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={busyId === confirmTarget.user_id}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {busyId === confirmTarget.user_id ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
