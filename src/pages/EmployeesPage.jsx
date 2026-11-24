import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getEmployees,
  deactivateEmployee,
  activateEmployee,
} from "../api/employees";
import { tokenStorage } from "../utils/tokenStorage";

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
    const fromStorage = tokenStorage.getUser?.();
    if (fromStorage) {
      return fromStorage.user_id || fromStorage.user?.user_id || "";
    }
  } catch {
    /* fall through */
  }

  try {
    const raw = localStorage.getItem(USER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    return parsed?.user_id || parsed?.user?.user_id || "";
  } catch {
    return "";
  }
};

// ======================================
// Small shared pieces
// ======================================
function Avatar({ name }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-[11px] font-bold text-white">
      {initials(name)}
    </div>
  );
}

function RolePill({ role }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold ${
        roleStyles[role] || roleStyles.EMPLOYEE
      }`}
    >
      {formatRole(role)}
    </span>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
          : "border-red-500/30 bg-red-500/15 text-red-300"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // { employee, action: "activate" | "deactivate" }
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [busyId, setBusyId] = useState("");

  const currentUserId = getCurrentUserId();

  // Load employees
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // getEmployees returns { success, message, count, data: [...] }
      const res = await getEmployees();
      setEmployees(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Load employees error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const isActive = (employee) =>
    String(employee.account_status).toUpperCase() === "ACTIVE";

  // Admin can activate or deactivate anyone except their own account
  const canToggle = (employee) => employee.user_id !== currentUserId;

  // Statistics
  const stats = useMemo(() => {
    const active = employees.filter(isActive).length;

    return {
      total: employees.length,
      active,
      deactivated: employees.length - active,
    };
  }, [employees]);

  // Search and filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !q ||
        employee.name?.toLowerCase().includes(q) ||
        employee.email?.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "ALL" || employee.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE"
          ? isActive(employee)
          : !isActive(employee));

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  const roleOptions = useMemo(
    () => [...new Set(employees.map((e) => e.role).filter(Boolean))],
    [employees]
  );

  // Activate or deactivate the chosen employee
  const handleConfirm = async () => {
    if (!confirmTarget) return;

    const { employee, action } = confirmTarget;
    const isDeactivate = action === "deactivate";

    setBusyId(employee.user_id);
    setError("");
    setSuccess("");

    try {
      if (isDeactivate) {
        await deactivateEmployee(employee.user_id);
      } else {
        await activateEmployee(employee.user_id);
      }

      setConfirmTarget(null);

      setSuccess(
        `${employee.name || employee.email} has been ${
          isDeactivate ? "deactivated" : "activated"
        } successfully.`
      );

      await loadEmployees();
    } catch (err) {
      console.error(`${action} error:`, err);

      setError(
        err.response?.data?.message ||
          err.message ||
          `Unable to ${action} this employee.`
      );

      setConfirmTarget(null);
    } finally {
      setBusyId("");
    }
  };

  const renderAction = (employee) => {
    if (!canToggle(employee)) {
      return <span className="text-xs text-[#6b7396]">-</span>;
    }

    const active = isActive(employee);
    const busy = busyId === employee.user_id;

    return (
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          setConfirmTarget({
            employee,
            action: active ? "deactivate" : "activate",
          })
        }
        className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
          active
            ? "border-red-500/30 text-red-300 hover:bg-red-500/10"
            : "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
        }`}
      >
        {busy ? "Working..." : active ? "Deactivate" : "Activate"}
      </button>
    );
  };

  const emptyMessage =
    employees.length === 0
      ? "No employees found in your organization."
      : "No employees match your filters.";

  const confirmIsDeactivate = confirmTarget?.action === "deactivate";
  const confirmEmployee = confirmTarget?.employee;
  const confirmBusy = confirmEmployee && busyId === confirmEmployee.user_id;

  return (
    // No extra padding here: DashboardLayout already pads the content area
    <div className="w-full min-w-0 max-w-none text-[#f3f5fb]">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Employees
          </h1>

          <p className="mt-1 text-xs leading-relaxed text-[#8a94b8] sm:text-sm">
            People in your organization. Admins can activate or deactivate
            access at any time.
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
          🔒 Admin only
        </span>
      </div>

      {/* Success message */}
      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-[#087d68] bg-[#0b2b32] px-4 py-3 text-sm text-[#34ebc1]"
        >
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span className="min-w-0 break-words">{error}</span>

          <button
            type="button"
            onClick={loadEmployees}
            className="shrink-0 rounded-md border border-red-500/30 px-3 py-1 text-xs font-semibold hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics: always 3 across, compact on small screens */}
      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["Total", stats.total, "text-[#f3f5fb]"],
          ["Active", stats.active, "text-emerald-300"],
          ["Inactive", stats.deactivated, "text-red-300"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-[#1d2545] bg-[#0d1326] px-3 py-2.5 sm:px-5 sm:py-4"
          >
            <div className="truncate text-[11px] text-[#6b7396] sm:text-xs">
              {label}
            </div>

            <div className={`mt-0.5 text-xl font-bold sm:text-2xl ${color}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="mb-4 grid min-w-0 grid-cols-2 gap-3 rounded-xl border border-[#1d2545] bg-[#0d1326] p-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="col-span-2 w-full min-w-0 rounded-lg border border-[#2a3358] bg-[#161d33] px-3.5 py-2.5 text-sm text-[#f3f5fb] placeholder-[#6b7396] outline-none transition focus:border-[#5b6ef5] focus:ring-1 focus:ring-[#5b6ef5] lg:col-span-1"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full min-w-0 rounded-lg border border-[#2a3358] bg-[#161d33] px-3 py-2.5 text-sm text-[#f3f5fb] outline-none focus:border-[#5b6ef5]"
        >
          <option value="ALL">All roles</option>

          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {formatRole(role)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full min-w-0 rounded-lg border border-[#2a3358] bg-[#161d33] px-3 py-2.5 text-sm text-[#f3f5fb] outline-none focus:border-[#5b6ef5]"
        >
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* DESKTOP / TABLET: fixed-width table, no sideways scrolling */}
      <div className="hidden w-full min-w-0 overflow-hidden rounded-xl border border-[#1d2545] bg-[#0d1326] lg:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-[#1d2545] text-[11px] uppercase tracking-wider text-[#6b7396]">
              {/* Member and Email share the leftover space; the rest are fixed */}
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="w-[120px] px-4 py-3 font-semibold">Role</th>
              <th className="w-[140px] px-4 py-3 font-semibold">Status</th>
              <th className="hidden w-[120px] px-4 py-3 font-semibold xl:table-cell">
                Joined
              </th>
              <th className="w-[130px] px-4 py-3 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[#8a94b8]"
                >
                  Loading employees...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[#8a94b8]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((employee) => {
                const active = isActive(employee);
                const isSelf = employee.user_id === currentUserId;

                return (
                  <tr
                    key={employee.user_id}
                    className="border-b border-[#1d2545] last:border-b-0 hover:bg-[#111830]"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={employee.name} />

                        <span
                          className="truncate font-semibold"
                          title={employee.name}
                        >
                          {employee.name || "-"}
                          {isSelf && (
                            <span className="ml-1.5 text-[10px] font-medium text-[#6b7396]">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td
                      className="truncate px-4 py-3.5 text-[#aab4d4]"
                      title={employee.email}
                    >
                      {employee.email}
                    </td>

                    <td className="px-4 py-3.5">
                      <RolePill role={employee.role} />
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusPill active={active} />

                      {!active && employee.deactivated_at && (
                        <div className="mt-1 truncate text-[10px] text-[#6b7396]">
                          since {formatDate(employee.deactivated_at)}
                        </div>
                      )}
                    </td>

                    <td className="hidden px-4 py-3.5 text-[#8a94b8] xl:table-cell">
                      {formatDate(employee.created_at)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {renderAction(employee)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* MOBILE: stacked cards */}
      <div className="space-y-3 lg:hidden">
        {loading && (
          <div className="rounded-xl border border-[#1d2545] bg-[#0d1326] px-4 py-8 text-center text-sm text-[#8a94b8]">
            Loading employees...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-[#1d2545] bg-[#0d1326] px-4 py-8 text-center text-sm text-[#8a94b8]">
            {emptyMessage}
          </div>
        )}

        {!loading &&
          filtered.map((employee) => {
            const active = isActive(employee);
            const isSelf = employee.user_id === currentUserId;

            return (
              <div
                key={employee.user_id}
                className="min-w-0 rounded-xl border border-[#1d2545] bg-[#0d1326] p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={employee.name} />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {employee.name || "-"}
                      {isSelf && (
                        <span className="ml-1.5 text-[10px] font-medium text-[#6b7396]">
                          (you)
                        </span>
                      )}
                    </div>

                    <div className="truncate text-xs text-[#aab4d4]">
                      {employee.email}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RolePill role={employee.role} />
                  <StatusPill active={active} />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#1d2545] pt-3">
                  <span className="text-[11px] text-[#6b7396]">
                    {!active && employee.deactivated_at
                      ? `Inactive since ${formatDate(employee.deactivated_at)}`
                      : `Joined ${formatDate(employee.created_at)}`}
                  </span>

                  {renderAction(employee)}
                </div>
              </div>
            );
          })}
      </div>

      {/* Record count */}
      <p className="mt-3 text-[11px] text-[#6b7396]">
        Showing {filtered.length} of {employees.length} employees
      </p>

      {/* Confirmation popup (activate or deactivate) */}
      {confirmTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#1d2545] bg-[#111827] p-6 text-center shadow-2xl">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-xl ${
                confirmIsDeactivate
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10"
              }`}
            >
              {confirmIsDeactivate ? "⚠️" : "✅"}
            </div>

            <h3 className="mb-2 text-lg font-bold">
              {confirmIsDeactivate
                ? "Deactivate employee?"
                : "Activate employee?"}
            </h3>

            <p className="break-words text-sm leading-relaxed text-[#aab4d4]">
              <span className="font-semibold text-white">
                {confirmEmployee.name || confirmEmployee.email}
              </span>{" "}
              {confirmIsDeactivate
                ? "will no longer be able to sign in or use the application."
                : "will be able to sign in and use the application again."}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={confirmBusy}
                className="flex-1 rounded-lg border border-[#2a3358] py-2.5 text-sm font-semibold transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirmBusy}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  confirmIsDeactivate
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {confirmBusy
                  ? confirmIsDeactivate
                    ? "Deactivating..."
                    : "Activating..."
                  : confirmIsDeactivate
                  ? "Deactivate"
                  : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
