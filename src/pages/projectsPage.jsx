import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "../utils/tokenStorage";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const EMPLOYEES_PATH = "/api/employees";
const PROJECTS_PATH = "/api/projects";
// Change to "PATCH" if your Postman collection uses PATCH for update
const UPDATE_METHOD = "PUT";

const authHeaders = () => {
  const token = tokenStorage.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const accents = ["#4a7cff", "#2ecf8e", "#f5a623", "#a78bfa", "#fb7185", "#38bdf8"];

const accentFor = (text = "") => {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return accents[sum % accents.length];
};

// Set to false if your backend doesn't accept a `status` field on projects
const SUPPORTS_STATUS = true;

const STATUSES = [
  {
    value: "Active",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    chip: "border-emerald-500 bg-emerald-500/15 text-emerald-300",
  },
  {
    value: "On hold",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
    chip: "border-amber-500 bg-amber-500/15 text-amber-300",
  },
  {
    value: "Completed",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    dot: "bg-blue-400",
    chip: "border-blue-500 bg-blue-500/15 text-blue-300",
  },
  {
    value: "Archived",
    badge: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    dot: "bg-slate-400",
    chip: "border-slate-400 bg-slate-500/15 text-slate-200",
  },
];

const normalizeStatus = (raw) => {
  const key = String(raw ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  const hit = STATUSES.find(
    (st) => st.value.toLowerCase().replace(/\s+/g, "") === key
  );
  return hit ? hit.value : "Active";
};

const statusStyle = (value) =>
  STATUSES.find((st) => st.value === value) ?? STATUSES[0];

const DATE_RANGES = [
  { value: "all", label: "All time", days: null },
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "90", label: "Last 90 days", days: 90 },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
];

const findList = (value, preferredKeys = []) => {
  if (Array.isArray(value)) {
    return value.every((item) => item && typeof item === "object") ? value : [];
  }
  if (!value || typeof value !== "object") return [];
  for (const key of preferredKeys) {
    if (Array.isArray(value[key])) return findList(value[key]);
  }
  for (const key of Object.keys(value)) {
    const found = findList(value[key], preferredKeys);
    if (found.length) return found;
  }
  return [];
};

const messageFrom = (body, status, fallback) => {
  let message =
    body?.message || (typeof body?.error === "string" ? body.error : "");
  if (!message && Array.isArray(body?.errors)) {
    message = body.errors.map((e) => e?.message || e).join(", ");
  }
  return `${message || fallback} (HTTP ${status})`;
};

const memberLabel = (member) => {
  if (!member || typeof member === "string") return "";
  return (
    member.name ?? member.full_name ?? member.user?.name ?? member.email ?? ""
  );
};

const memberId = (member) =>
  typeof member === "string"
    ? member
    : member?.user_id ?? member?.id ?? member?.user?.id ?? null;

const toProject = (project) => {
  const rawMembers =
    project.members ?? project.project_members ?? project.member_ids ?? [];
  return {
    id: project.project_id ?? project.id,
    name: project.name ?? project.project_name ?? "Untitled project",
    description: project.description ?? "",
    createdAt: project.created_at ?? project.createdAt ?? null,
    status: normalizeStatus(project.status ?? project.project_status),
    members: Array.isArray(rawMembers) ? rawMembers : [],
  };
};

const toEmployee = (employee) => {
  const email = employee.email ?? employee.user?.email ?? "";
  return {
    id:
      employee.user_id ??
      employee.id ??
      employee.profile_id ??
      employee.user?.id,
    name:
      employee.name ??
      employee.full_name ??
      employee.user?.name ??
      (email ? email.split("@")[0] : "Unnamed"),
    email,
    orgId: employee.organization_id ?? employee.org_id ?? null,
  };
};

const currentUser = () => {
  const user = tokenStorage.getUser();
  if (!user) return null;
  const id = user.user_id ?? user.id ?? user.sub ?? null;
  if (!id) return null;
  return {
    id,
    email: user.email ?? "",
    orgId: user.organization_id ?? user.organizationId ?? null,
    role: String(user.role ?? user.user_role ?? "").toUpperCase(),
  };
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const inputClasses =
  "w-full rounded-lg border border-[#293752] bg-[#101a2e] px-3.5 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30";
const selectClasses =
  "w-full appearance-none rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition focus:border-blue-500";
const labelClasses = "mb-2 block text-xs font-semibold text-slate-400";
const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-[#293752] text-sm text-slate-300 transition hover:bg-[#1a2942] focus:outline-none focus:ring-2 focus:ring-blue-400";

/* ---------- small reusable pieces ---------- */

function Modal({ title, subtitle, onClose, children, wide = false }) {
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
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-xl border border-[#263653] bg-[#0b1427] p-5 shadow-2xl sm:p-6 ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className={iconBtn}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MemberPicker({
  options,
  selectedIds,
  onToggle,
  loading,
  error,
  open,
  setOpen,
}) {
  const hasOthers = options.some((o) => !o.isMe);

  return (
    <div className="relative">
      <label className={labelClasses}>Assign members</label>
      <button
        type="button"
        disabled={options.length === 0 && !loading}
        onClick={() => setOpen((v) => !v)}
        className={`${inputClasses} flex items-center justify-between text-left`}
      >
        <span className="truncate">
          {selectedIds.length
            ? `${selectedIds.length} ${
                selectedIds.length === 1 ? "member" : "members"
              } selected`
            : loading
            ? "Loading members..."
            : options.length === 0
            ? "No members available"
            : "Select project members"}
        </span>
        <span className="text-slate-400">⌄</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close member selector"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#293752] bg-[#0b1427] p-2 shadow-2xl">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-[#17243c]"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => onToggle(option.id)}
                  className="h-4 w-4 accent-blue-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {option.name}
                    {option.isMe && (
                      <span className="ml-2 rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                        Admin
                      </span>
                    )}
                  </span>
                  {option.email && (
                    <span className="block truncate text-xs text-slate-500">
                      {option.email}
                    </span>
                  )}
                </span>
              </label>
            ))}
            {loading && (
              <p className="p-3 text-xs text-slate-400">Loading employees...</p>
            )}
            {error && <p className="p-3 text-xs text-amber-300">{error}</p>}
            {!loading && !hasOthers && (
              <p className="border-t border-[#293752] p-3 text-xs text-slate-500">
                No other employees are available yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AvatarStack({ members }) {
  const named = members.filter((m) => memberLabel(m));
  return (
    <div className="flex -space-x-2">
      {named.slice(0, 3).map((member, index) => {
        const label = memberLabel(member);
        return (
          <span
            key={index}
            title={label}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#101a2e] text-[10px] font-bold text-[#08101e]"
            style={{ backgroundColor: accentFor(label) }}
          >
            {label.slice(0, 2).toUpperCase()}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- page ---------- */

export default function Projects() {
  const navigate = useNavigate();
  const me = useMemo(() => currentUser(), []);
  const isAdmin = me?.role === "ADMIN";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState("");

  const [search, setSearch] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [memberFilter, setMemberFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [success, setSuccess] = useState("");

  // modal state: { type: "create" | "edit" | "view" | "delete", project }
  const [modal, setModal] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  // form state (shared by create + edit)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [selectedIds, setSelectedIds] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleExpired = useCallback(() => {
    tokenStorage.clearSession();
    navigate("/", { replace: true });
  }, [navigate]);

  /* ----- API calls ----- */

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${API}${PROJECTS_PATH}`, {
        headers: authHeaders(),
      });
      if (res.status === 401) return handleExpired();
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(messageFrom(body, res.status, "Could not load projects"));
      }
      setProjects(findList(body, ["projects", "items", "rows"]).map(toProject));
    } catch (error) {
      setLoadError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [handleExpired]);

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError("");
    try {
      const res = await fetch(`${API}${EMPLOYEES_PATH}`, {
        headers: authHeaders(),
      });
      if (res.status === 401) return handleExpired();
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(messageFrom(body, res.status, "Could not load employees"));
      }
      const orgId = currentUser()?.orgId;
      setEmployees(
        findList(body, ["employees", "users", "members", "items", "rows"])
          .map(toEmployee)
          .filter((e) => e.id)
          .filter((e) => !orgId || !e.orgId || e.orgId === orgId)
      );
    } catch (error) {
      setEmployeesError(error.message || "Could not load employees.");
    } finally {
      setEmployeesLoading(false);
    }
  }, [handleExpired]);

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, [loadProjects, loadEmployees]);

  // GET /api/projects/:id
  const fetchProjectById = useCallback(
    async (id) => {
      setViewLoading(true);
      setViewError("");
      try {
        const res = await fetch(
          `${API}${PROJECTS_PATH}/${encodeURIComponent(id)}`,
          { headers: authHeaders() }
        );
        if (res.status === 401) return handleExpired();
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body.success === false) {
          throw new Error(messageFrom(body, res.status, "Could not load project"));
        }
        const raw = body.data?.project ?? body.data ?? body.project ?? body;
        setModal({ type: "view", project: toProject(raw) });
      } catch (error) {
        setViewError(error.message || "Could not load project.");
      } finally {
        setViewLoading(false);
      }
    },
    [handleExpired]
  );

  /* ----- member options ----- */

  const memberOptions = useMemo(() => {
    const list = [];
    if (me?.id) {
      list.push({ id: me.id, name: "You", email: me.email, isMe: true });
    }
    employees.forEach((e) => {
      if (e.id !== me?.id) list.push(e);
    });
    return list;
  }, [me, employees]);

  const toggleMember = (id) =>
    setSelectedIds((list) =>
      list.includes(id) ? list.filter((i) => i !== id) : [...list, id]
    );

  /* ----- modal openers ----- */

  const closeModal = () => {
    setModal(null);
    setPickerOpen(false);
    setFormError("");
  };

  const openCreate = () => {
    setName("");
    setDescription("");
    setStatus("Active");
    setSelectedIds([]);
    setFormError("");
    setSuccess("");
    setModal({ type: "create" });
  };

  const openEdit = (project) => {
    setName(project.name);
    setDescription(project.description);
    setStatus(project.status);
    setSelectedIds(project.members.map(memberId).filter(Boolean));
    setFormError("");
    setSuccess("");
    setModal({ type: "edit", project });
  };

  const openDelete = (project) => {
    setFormError("");
    setSuccess("");
    setModal({ type: "delete", project });
  };

  const openView = (project) => {
    setViewError("");
    setModal({ type: "view", project }); // show list data instantly…
    fetchProjectById(project.id); // …then refresh from GET /:id
  };

  const lookupProject = (event) => {
    event.preventDefault();
    const id = lookupId.trim();
    if (!id) return;
    setViewError("");
    fetchProjectById(id);
  };

  /* ----- create / update / delete ----- */

  const submitForm = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setFormError("Please enter a valid project name.");
      return;
    }

    const editing = modal?.type === "edit";
    setSaving(true);
    setFormError("");

    try {
      const res = await fetch(
        editing
          ? `${API}${PROJECTS_PATH}/${encodeURIComponent(modal.project.id)}`
          : `${API}${PROJECTS_PATH}`,
        {
          method: editing ? UPDATE_METHOD : "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            name: cleanName,
            description: description.trim(),
            member_ids: selectedIds,
            ...(SUPPORTS_STATUS ? { status } : {}),
          }),
        }
      );
      if (res.status === 401) return handleExpired();
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(
          messageFrom(
            body,
            res.status,
            editing ? "Could not update project" : "Could not create project"
          )
        );
      }
      setSuccess(
        body.message ||
          `Project "${cleanName}" ${editing ? "updated" : "created"}.`
      );
      closeModal();
      await loadProjects();
    } catch (error) {
      setFormError(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!isAdmin || !modal?.project) return;
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(
        `${API}${PROJECTS_PATH}/${encodeURIComponent(modal.project.id)}`,
        { method: "DELETE", headers: authHeaders() }
      );
      if (res.status === 401) return handleExpired();
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(messageFrom(body, res.status, "Could not delete project"));
      }
      setSuccess(body.message || `Project "${modal.project.name}" deleted.`);
      closeModal();
      await loadProjects();
    } catch (error) {
      setFormError(error.message || "Could not delete project.");
    } finally {
      setSaving(false);
    }
  };

  /* ----- search ----- */

  const query = search.trim().toLowerCase();

  const visibleProjects = useMemo(() => {
    const days = DATE_RANGES.find((r) => r.value === rangeFilter)?.days;
    const cutoff = days ? Date.now() - days * 86400000 : null;

    const list = projects.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;

      if (
        memberFilter !== "all" &&
        !p.members.some((m) => String(memberId(m)) === memberFilter)
      ) {
        return false;
      }

      if (cutoff) {
        const t = p.createdAt ? new Date(p.createdAt).getTime() : NaN;
        if (Number.isNaN(t) || t < cutoff) return false;
      }

      if (!query) return true;
      const haystack = `${p.name} ${p.description} ${p.status} ${p.members
        .map(memberLabel)
        .join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });

    const time = (p) => (p.createdAt ? new Date(p.createdAt).getTime() : 0);
    return [...list].sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : sortBy === "oldest"
        ? time(a) - time(b)
        : time(b) - time(a)
    );
  }, [projects, query, statusFilter, memberFilter, rangeFilter, sortBy]);

  const filtersActive =
    statusFilter !== "All" ||
    memberFilter !== "all" ||
    rangeFilter !== "all" ||
    query !== "";

  const clearFilters = () => {
    setStatusFilter("All");
    setMemberFilter("all");
    setRangeFilter("all");
    setSearch("");
  };

  /* ----- render ----- */

  const formOpen = modal?.type === "create" || modal?.type === "edit";

  return (
    <div className="min-w-0 w-full space-y-6 text-slate-100">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading
              ? "Loading projects..."
              : `${projects.length} ${
                  projects.length === 1 ? "project" : "projects"
                } across your organization`}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2160f5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span className="text-lg leading-none">+</span>
            New project
          </button>
        )}
      </div>

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {success}
        </div>
      )}

      {/* STATUS CHIPS */}
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter by status">
        {["All", ...STATUSES.map((st) => st.value)].map((value) => {
          const active = statusFilter === value;
          const chipColor = active
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
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${chipColor}`}
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
        {[
          {
            id: "filter-member",
            label: "Filter by member",
            value: memberFilter,
            onChange: setMemberFilter,
            options: [
              { value: "all", label: "All members" },
              ...memberOptions.map((o) => ({
                value: String(o.id),
                label: o.isMe ? "You" : o.name,
              })),
            ],
          },
          {
            id: "filter-range",
            label: "Filter by created date",
            value: rangeFilter,
            onChange: setRangeFilter,
            options: DATE_RANGES,
          },
          {
            id: "filter-sort",
            label: "Sort projects",
            value: sortBy,
            onChange: setSortBy,
            options: SORTS,
          },
        ].map((f) => (
          <div key={f.id} className="relative">
            <label htmlFor={f.id} className="sr-only">
              {f.label}
            </label>
            <select
              id={f.id}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className={selectClasses}
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ⌄
            </span>
          </div>
        ))}
      </div>

      {/* SEARCH + OPEN BY ID */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <input
            id="project-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, descriptions, members..."
            className="w-full rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>

        <form onSubmit={lookupProject} className="flex gap-2 lg:w-96">
          <label htmlFor="project-lookup" className="sr-only">
            Open project by ID
          </label>
          <input
            id="project-lookup"
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Open project by ID"
            className="min-w-0 flex-1 rounded-lg border border-[#243049] bg-[#0f1729] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!lookupId.trim() || viewLoading}
            className="rounded-lg border border-[#243049] bg-[#0f1729] px-4 text-sm font-medium text-slate-200 transition hover:bg-[#16213a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {viewLoading ? "..." : "Open"}
          </button>
        </form>
      </div>

      {viewError && !modal && (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
        >
          {viewError}
        </p>
      )}

      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadProjects}
            className="rounded-lg border border-rose-400/40 px-3 py-1.5 font-semibold hover:bg-rose-500/10"
          >
            Try again
          </button>
        </div>
      )}

      {/* PROJECT LIST */}
      <div className="overflow-hidden rounded-xl border border-[#202c46] bg-[#101a2e]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202c46] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">All projects</h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage and track your organization's projects.
            </p>
          </div>
          <span className="rounded-lg border border-[#293752] px-3 py-2 text-xs text-slate-400">
            {visibleProjects.length} displayed
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
            <p className="text-sm text-slate-400">Loading projects...</p>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mb-3 text-3xl text-slate-500">◫</div>
            <h3 className="text-base font-semibold text-white">
              {projects.length === 0 ? "No projects yet" : "No matching projects"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {projects.length === 0
                ? isAdmin
                  ? "Create your first project to get started."
                  : "An admin can create the first project."
                : "Try a different search or clear your filters."}
            </p>
            {projects.length > 0 && filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg border border-[#34435e] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-[#1a2942]"
              >
                Clear filters
              </button>
            )}
            {projects.length === 0 && isAdmin && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 rounded-lg bg-[#2160f5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                + New project
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#202c46] text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3 font-semibold">Project</th>
                  <th className="px-3 py-3 font-semibold">Description</th>
                  <th className="px-3 py-3 font-semibold">Members</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((project) => (
                  <tr
                    key={project.id ?? project.name}
                    className="border-b border-[#1a2640] transition last:border-0 hover:bg-[#121e35]"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openView(project)}
                        className="flex items-center gap-3 text-left focus:outline-none"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-[#08101e]"
                          style={{ backgroundColor: accentFor(project.name) }}
                        >
                          {project.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span
                          className="max-w-[200px] truncate font-semibold text-white hover:text-blue-300"
                          title={project.name}
                        >
                          {project.name}
                        </span>
                      </button>
                    </td>
                    <td className="max-w-[260px] px-3 py-4 text-slate-400">
                      <span className="line-clamp-2">
                        {project.description || "No description available."}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <AvatarStack members={project.members} />
                        <span className="text-xs text-slate-400">
                          {project.members.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                          statusStyle(project.status).badge
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            statusStyle(project.status).dot
                          }`}
                        />
                        {project.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="View details"
                          aria-label={`View ${project.name}`}
                          onClick={() => openView(project)}
                          className={iconBtn}
                        >
                          👁
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              title="Edit project"
                              aria-label={`Edit ${project.name}`}
                              onClick={() => openEdit(project)}
                              className={iconBtn}
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              title="Delete project"
                              aria-label={`Delete ${project.name}`}
                              onClick={() => openDelete(project)}
                              className={`${iconBtn} text-rose-300 hover:bg-rose-500/10`}
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {formOpen && isAdmin && (
        <Modal
          wide
          title={modal.type === "edit" ? "Edit project" : "Create new project"}
          subtitle={
            modal.type === "edit"
              ? "Update the project details and members."
              : "Add project details and assign organization members."
          }
          onClose={closeModal}
        >
          <form onSubmit={submitForm} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="project-name" className={labelClasses}>
                  Project name *
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError("");
                  }}
                  placeholder="Enter project name"
                  maxLength={80}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="project-description" className={labelClasses}>
                  Description
                </label>
                <input
                  id="project-description"
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setFormError("");
                  }}
                  placeholder="Enter project description"
                  maxLength={300}
                  className={inputClasses}
                />
              </div>
            </div>

            {SUPPORTS_STATUS && (
              <div>
                <label htmlFor="project-status" className={labelClasses}>
                  Status
                </label>
                <div className="relative">
                  <select
                    id="project-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={selectClasses}
                  >
                    {STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.value}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    ⌄
                  </span>
                </div>
              </div>
            )}

            <MemberPicker
              options={memberOptions}
              selectedIds={selectedIds}
              onToggle={toggleMember}
              loading={employeesLoading}
              error={employeesError}
              open={pickerOpen}
              setOpen={setPickerOpen}
            />

            {employeesError && (
              <button
                type="button"
                onClick={loadEmployees}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Reload employee list
              </button>
            )}

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
              >
                {formError}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#293752] pt-5">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-[#34435e] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-[#1a2942]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2160f5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? modal.type === "edit"
                    ? "Saving..."
                    : "Creating..."
                  : modal.type === "edit"
                  ? "Save changes"
                  : "Create project"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {modal?.type === "delete" && isAdmin && (
        <Modal
          title="Delete project?"
          subtitle="This can't be undone."
          onClose={closeModal}
        >
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">
              {modal.project.name}
            </span>{" "}
            will be permanently removed for everyone in your organization.
          </p>

          {formError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
            >
              {formError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-[#34435e] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-[#1a2942]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={saving}
              className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Deleting..." : "Delete project"}
            </button>
          </div>
        </Modal>
      )}

      {/* VIEW DETAILS (fetched by project ID) */}
      {modal?.type === "view" && (
        <Modal
          wide
          title={modal.project.name}
          subtitle={`Project ID: ${modal.project.id ?? "—"}`}
          onClose={closeModal}
        >
          {viewLoading && (
            <p className="mb-3 text-xs text-slate-400">Refreshing details...</p>
          )}
          {viewError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
            >
              {viewError}
            </p>
          )}

          <div className="space-y-5">
            <div>
              <p className={labelClasses}>Description</p>
              <p className="text-sm leading-6 text-slate-300">
                {modal.project.description || "No description available."}
              </p>
            </div>

            <div>
              <p className={labelClasses}>Status</p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${
                  statusStyle(modal.project.status).badge
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    statusStyle(modal.project.status).dot
                  }`}
                />
                {modal.project.status}
              </span>
            </div>

            <div>
              <p className={labelClasses}>Created</p>
              <p className="text-sm text-slate-300">
                {formatDate(modal.project.createdAt)}
              </p>
            </div>

            <div>
              <p className={labelClasses}>
                Members ({modal.project.members.length})
              </p>
              {modal.project.members.length === 0 ? (
                <p className="text-sm text-slate-500">No members assigned.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {modal.project.members.map((member, index) => {
                    const label = memberLabel(member) || "Member";
                    return (
                      <li
                        key={index}
                        className="flex items-center gap-3 rounded-lg border border-[#293752] bg-[#101a2e] px-3 py-2"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#08101e]"
                          style={{ backgroundColor: accentFor(label) }}
                        >
                          {label.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="truncate text-sm text-white">
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 flex justify-end gap-3 border-t border-[#293752] pt-5">
              <button
                type="button"
                onClick={() => openDelete(modal.project)}
                className="rounded-lg border border-rose-500/40 px-5 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => openEdit(modal.project)}
                className="rounded-lg bg-[#2160f5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Edit
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
