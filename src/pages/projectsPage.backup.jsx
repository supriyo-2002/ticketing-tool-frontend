import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../api/axiosInstance";
import { tokenStorage } from "../utils/tokenStorage";

const API = import.meta.env.VITE_API_BASE_URL;

// Address that returns the employees of your organization.
// Check the "employees" folder in Postman and change this if the path is different.
const EMPLOYEES_PATH = "/api/employees";

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

// Finds a list of objects anywhere in the backend response
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

// Builds a readable error from the backend response
const messageFrom = (body, status, fallback) => {
  let text = body?.message || (typeof body?.error === "string" ? body.error : "");
  if (!text && Array.isArray(body?.errors)) {
    text = body.errors.map((e) => e?.message || e).join(", ");
  }
  return `${text || fallback} (HTTP ${status})`;
};

const memberLabel = (m) => {
  if (!m || typeof m === "string") return "";
  return m.name ?? m.full_name ?? m.user?.name ?? m.email ?? "";
};

// Turns a backend project into the shape this page uses
const toProject = (p) => {
  const rawMembers = p.members ?? p.project_members ?? p.member_ids ?? [];
  return {
    id: p.project_id ?? p.id,
    name: p.name ?? p.project_name ?? "Untitled project",
    description: p.description ?? "",
    createdAt: p.created_at ?? p.createdAt ?? null,
    members: Array.isArray(rawMembers) ? rawMembers : [],
  };
};

// Turns a backend employee into the shape this page uses
const toEmployee = (e) => {
  const email = e.email ?? e.user?.email ?? "";
  return {
    id: e.user_id ?? e.id ?? e.profile_id ?? e.user?.id,
    name:
      e.name ?? e.full_name ?? e.user?.name ?? (email ? email.split("@")[0] : "Unnamed"),
    email,
    orgId: e.organization_id ?? e.org_id ?? null,
  };
};

// The logged-in user, read from the saved login (token + saved user, if any)
const currentUser = () => {
  const user = tokenStorage.getUser();

  if (!user) return null;

  const id = user.user_id ?? user.id ?? user.sub ?? null;

  if (!id) return null;

  return {
    id,
    email: user.email ?? "",
    orgId: user.organization_id ?? user.organizationId ?? null,
  };
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const inputClasses =
  "w-full rounded-lg border border-[#263653] bg-[#0b1427] px-3 py-2 text-xs outline-none placeholder:text-slate-600 focus:border-blue-500";

const labelClasses = "mb-1 block text-[11px] font-semibold text-slate-400";

export default function Projects() {
  const navigate = useNavigate();
  const me = useMemo(() => currentUser(), []);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  // If the login has expired, clear it and go back to the login page
 const handleExpired = useCallback(() => {
  tokenStorage.clearSession();
  navigate("/", { replace: true });
}, [navigate]);

  // GET all projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const res = await fetch(`${API}/api/projects`, { headers: authHeaders() });

      if (res.status === 401) {
        handleExpired();
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(messageFrom(body, res.status, "Could not load projects"));
      }

      setProjects(findList(body, ["projects", "items", "rows"]).map(toProject));
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [handleExpired]);

  // GET the employees of your organization, for the Members dropdown
  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError("");

    try {
      const res = await fetch(`${API}${EMPLOYEES_PATH}`, { headers: authHeaders() });

      if (res.status === 401) {
        handleExpired();
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(messageFrom(body, res.status, "Could not load employees"));
      }

      const orgId = currentUser()?.orgId;
      const list = findList(body, ["employees", "users", "members", "items", "rows"])
        .map(toEmployee)
        .filter((e) => e.id)
        // Keep only people from the same organization when both sides tell us
        .filter((e) => !orgId || !e.orgId || e.orgId === orgId);

      setEmployees(list);
    } catch (err) {
      setEmployeesError(err.message);
    } finally {
      setEmployeesLoading(false);
    }
  }, [handleExpired]);

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, [loadProjects, loadEmployees]);

  // Dropdown options: you first, then everyone else in the organization
  const memberOptions = useMemo(() => {
    const list = [];
    if (me?.id) {
      list.push({ id: me.id, name: "You", email: me.email, isMe: true });
    }
    employees.forEach((emp) => {
      if (emp.id !== me?.id) list.push(emp);
    });
    return list;
  }, [me, employees]);

  const hasOthers = memberOptions.some((o) => !o.isMe);

  const toggleMember = (id) => {
    setSelectedIds((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedIds([]);
    setPickerOpen(false);
    setFormError("");
  };

  const cancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  // POST a new project: { name, description, member_ids }
  const createProject = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (cleanName.length < 2) {
      setFormError("Please enter a project name.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/projects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: cleanName,
          description: cleanDescription,
          member_ids: selectedIds,
        }),
      });

      if (res.status === 401) {
        handleExpired();
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(messageFrom(body, res.status, "Could not create the project"));
      }

      setSuccess(body.message || `Project "${cleanName}" created.`);
      resetForm();
      setShowForm(false);

      // Reload from the backend so the list always matches the database
      await loadProjects();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const query = search.trim().toLowerCase();

  const visibleProjects = useMemo(
    () =>
      projects.filter((p) =>
        `${p.name} ${p.description}`.toLowerCase().includes(query)
      ),
    [projects, query]
  );

  return (
    <div className="min-w-0 text-slate-100">
      {/* Search + new project button */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <input
          id="project-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full max-w-sm rounded-lg border border-[#202c46] bg-[#111c33] px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500"
        />

        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError("");
            setSuccess("");
          }}
          className="rounded-lg bg-[#4c7dff] px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {showForm ? "Close form" : "+ New project"}
        </button>
      </div>

      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-xl font-bold sm:text-2xl">Projects</h1>
        <p className="mt-1 text-xs text-slate-400">
          {loading
            ? "Loading..."
            : `${projects.length} ${projects.length === 1 ? "project" : "projects"}${
                query ? ` · ${visibleProjects.length} shown` : ""
              }`}
        </p>
      </div>

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
        >
          {success}
        </div>
      )}

      {/* Create project form: name, description, member_ids */}
      {showForm && (
        <form
          onSubmit={createProject}
          className="mb-4 rounded-xl border border-[#202d49] bg-[#111d36] p-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1.4fr_1fr_auto] xl:items-end">
            <div>
              <label htmlFor="project-name" className={labelClasses}>
                Name
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
                placeholder="Website Redesign"
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
                placeholder="Redesign the company website"
                maxLength={300}
                className={inputClasses}
              />
            </div>

            {/* Members dropdown: you + everyone in the same organization */}
            <div className="relative">
              <label htmlFor="project-members" className={labelClasses}>
                Members
              </label>

              <button
                id="project-members"
                type="button"
                disabled={memberOptions.length === 0 && !employeesLoading}
                onClick={() => setPickerOpen((o) => !o)}
                className={`${inputClasses} flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="truncate">
                  {selectedIds.length
                    ? `${selectedIds.length} selected`
                    : employeesLoading
                    ? "Loading members..."
                    : memberOptions.length === 0
                    ? "No members available"
                    : "Select members"}
                </span>
                <span className="text-slate-500">▾</span>
              </button>

              {pickerOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setPickerOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[#263653] bg-[#0b1427] p-1 shadow-xl">
                    {memberOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-[#162340]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(opt.id)}
                          onChange={() => toggleMember(opt.id)}
                          className="h-3.5 w-3.5 shrink-0 accent-blue-500"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {opt.name}
                            {opt.isMe && (
                              <span className="ml-1.5 rounded bg-[#16224a] px-1.5 py-0.5 text-[9px] font-semibold text-[#7aa2ff]">
                                Admin
                              </span>
                            )}
                          </span>
                          {opt.email && (
                            <span className="block truncate text-[10px] text-slate-500">
                              {opt.email}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}

                    {employeesLoading && (
                      <p className="px-2 py-2 text-[11px] text-slate-500">
                        Loading employees...
                      </p>
                    )}

                    {!employeesLoading && !hasOthers && (
                      <p className="border-t border-[#1c2943] px-2 py-2 text-[11px] text-slate-500">
                        No other employees in your organization yet. People appear here
                        after they accept their invitation.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-lg border border-[#263653] px-3 py-2 text-xs transition hover:bg-[#182540]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>

          {employeesError && !employeesLoading && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-amber-300">
              <span>Couldn’t load the employee list: {employeesError}</span>
              <button
                type="button"
                onClick={loadEmployees}
                className="rounded-md border border-amber-400/40 px-2 py-0.5 font-semibold hover:bg-amber-500/10"
              >
                Reload
              </button>
            </div>
          )}

          {formError && (
            <p
              role="alert"
              className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
            >
              {formError}
            </p>
          )}
        </form>
      )}

      {/* Load error */}
      {loadError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadProjects}
            className="rounded-md border border-rose-400/40 px-3 py-1 font-semibold hover:bg-rose-500/20"
          >
            Try again
          </button>
        </div>
      )}

      {/* Project cards */}
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <section
              key={project.id ?? project.name}
              className="min-w-0 rounded-xl border border-[#202d49] bg-[#111d36] p-3.5"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-[#08101e]"
                  style={{ backgroundColor: accentFor(project.name) }}
                >
                  {project.name.slice(0, 1).toUpperCase()}
                </span>
                <h2
                  className="min-w-0 flex-1 truncate text-sm font-semibold"
                  title={project.name}
                >
                  {project.name}
                </h2>
              </div>

              <p className="min-h-[2rem] text-xs leading-5 text-slate-400">
                {project.description || "No description."}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#1c2943] pt-2.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {project.members
                      .filter((m) => memberLabel(m))
                      .slice(0, 4)
                      .map((m, i) => (
                        <span
                          key={i}
                          title={memberLabel(m)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#111d36] text-[9px] font-bold text-[#08101e]"
                          style={{ backgroundColor: accentFor(memberLabel(m)) }}
                        >
                          {memberLabel(m).slice(0, 2).toUpperCase()}
                        </span>
                      ))}
                  </div>
                  <span>
                    {project.members.length}{" "}
                    {project.members.length === 1 ? "member" : "members"}
                  </span>
                </div>
                <span>{formatDate(project.createdAt)}</span>
              </div>
            </section>
          ))}

          {!loadError && visibleProjects.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#263653] p-5 text-center sm:col-span-2 xl:col-span-3">
              <p className="text-sm text-slate-400">
                {projects.length === 0
                  ? "No projects yet. Click “+ New project” to create the first one."
                  : "No projects match your search."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}