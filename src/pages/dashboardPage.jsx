import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// API helpers (the same ones the Tickets page uses)
import { getProjects } from "../api/project.js";
import { getTickets } from "../api/tickets.js";
import { getStatuses } from "../api/statuses.js";
import { getPriorities } from "../api/priorities.js";
import { getEmployees } from "../api/employees.js";
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

// Calls GET /api/dashboard and returns the "data" part of the response:
// { role, totalProjects, totalEmployees, totalTickets,
//   openTickets, inProgressTickets, resolvedTickets, closedTickets }
async function fetchDashboardStats() {
  const token = tokenStorage.getAccessToken?.();

  const res = await fetch(`${API}/api/dashboard`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Token expired or invalid: tag the error so the caller can log the user out.
  if (res.status === 401) {
    const err = new Error("Session expired. Please sign in again.");
    err.status = 401;
    throw err;
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    throw new Error(
      body.message || `Could not load dashboard statistics (HTTP ${res.status}).`
    );
  }

  return body.data ?? body;
}

// Returns the API number if it is a valid number, otherwise the fallback.
// Used so the cards still work if the stats call fails.
const pick = (apiValue, fallback) =>
  apiValue != null && Number.isFinite(Number(apiValue))
    ? Number(apiValue)
    : fallback;

/* =========================
   HELPERS
========================= */

// "1 employee" / "2 employees".
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Colors used for avatar circles.
const AVATAR_COLORS = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-violet-400",
  "bg-rose-400",
  "bg-sky-400",
];

// The API can return a list directly or wrapped in an object
// (e.g. { tickets: [...] } or { data: { tickets: [...] } }).
function getArray(response, keys = []) {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;

  for (const key of keys) {
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  return [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong."
  );
}

// Same name always gets the same avatar color.
const colorFor = (text = "") => {
  let sum = 0;
  for (const ch of String(text)) sum += ch.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

// "Dev Kapoor" -> "DK"
const initialsOf = (name = "") => {
  const parts = String(name).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Lowercases and treats "in_progress" / "in-progress" like "in progress".
const normalize = (value) =>
  String(value || "").toLowerCase().replace(/[_-]+/g, " ").trim();

// Date formatters. All return "—" for missing or invalid dates.
const formatShortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
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

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Date string -> timestamp in ms (0 if missing/invalid).
const timeOf = (value) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

// Timestamp of today at 00:00, used to decide if a due date has passed.
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// Tickets may use "ticket_id" or "id" depending on the API.
const ticketId = (ticket) => ticket?.ticket_id ?? ticket?.id;

// Display number: the API's own number/code, otherwise "TCK-" + first 8 chars of the id.
const ticketNumber = (ticket) => {
  const id = ticketId(ticket);
  return (
    ticket.ticket_number ||
    ticket.ticket_code ||
    (id != null ? `TCK-${String(id).slice(0, 8)}` : "—")
  );
};

// Bar/dot color for each priority.
const priorityBarColor = (name) => {
  const key = normalize(name);
  if (key === "critical") return "bg-rose-500";
  if (key === "high") return "bg-amber-400";
  if (key === "medium") return "bg-blue-500";
  if (key === "low") return "bg-slate-500";
  return "bg-slate-600";
};

// Optional project status (only shown if the API returns one).
const PROJECT_STATUS = {
  active: {
    label: "Active",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  onhold: {
    label: "On hold",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  completed: {
    label: "Completed",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    dot: "bg-blue-400",
  },
  archived: {
    label: "Archived",
    badge: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    dot: "bg-slate-400",
  },
};

const projectStatusOf = (raw) => {
  if (!raw) return null;
  const key = String(raw).toLowerCase().replace(/[\s_-]+/g, "");
  return PROJECT_STATUS[key] || null;
};

/* =========================
   SMALL COMPONENTS
========================= */

// Round avatar showing initials. "size" lets us use smaller ones in stacks.
function Avatar({ initials, color = "bg-blue-500", size = "h-8 w-8 text-[10px]" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${color} font-bold text-slate-950 ${size}`}
    >
      {initials}
    </span>
  );
}

// Colored pill for a ticket status.
function StatusBadge({ status }) {
  const key = normalize(status);

  let style = "bg-slate-700/50 text-slate-300";
  let dot = "bg-slate-400";

  if (key === "open") {
    style = "bg-blue-500/15 text-blue-300";
    dot = "bg-blue-400";
  } else if (key.includes("progress")) {
    style = "bg-amber-500/15 text-amber-300";
    dot = "bg-amber-400";
  } else if (key === "resolved") {
    style = "bg-emerald-500/15 text-emerald-300";
    dot = "bg-emerald-400";
  } else if (key === "closed") {
    style = "bg-slate-600/30 text-slate-300";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      {status || "Unknown"}
    </span>
  );
}

// Colored tag for a ticket priority.
function PriorityBadge({ priority }) {
  const key = normalize(priority);

  let style = "bg-slate-700/50 text-slate-300";
  if (key === "critical") style = "bg-rose-500/15 text-rose-300";
  else if (key === "high") style = "bg-amber-500/15 text-amber-300";
  else if (key === "medium") style = "bg-blue-500/15 text-blue-300";
  else if (key === "low") style = "bg-slate-500/15 text-slate-400";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      {priority || "Unknown"}
    </span>
  );
}

// Card wrapper used for every dashboard section: title, optional subtitle and action link.
function Panel({ title, subtitle, action, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#1d2944] bg-[#111d36]">
      <div className="flex items-center justify-between gap-3 border-b border-[#202943] px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white sm:text-[15px]">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// One of the four summary cards at the top.
function StatCard({ label, value, note, noteColor, accent, loading }) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-[#1d2944] bg-gradient-to-br from-[#13213f] to-[#0f1a33] p-4 transition hover:border-[#344568] sm:p-5">
      {/* Thin colored line along the top edge */}
      <span className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />

      <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {loading ? "—" : value}
      </p>
      <p
        className={`mt-1.5 break-words text-[11px] font-medium ${
          loading ? "text-slate-600" : noteColor
        }`}
      >
        {loading ? "Loading..." : note}
      </p>
    </div>
  );
}

// Small rounded pill used for the totals under the page title.
function Chip({ value, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#202943] bg-[#0f1930] px-3 py-1.5 text-xs text-slate-400">
      <strong className="font-semibold text-slate-100">{value}</strong>
      {label}
    </span>
  );
}

// Grey pulsing blocks shown while data loads.
function SkeletonRows({ rows = 4 }) {
  return (
    <div className="space-y-3 p-4 sm:p-5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-[#16213a]" />
      ))}
    </div>
  );
}

// Label + value pair used inside the detail popups.
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

function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#26344e] text-slate-400 transition hover:bg-slate-800 hover:text-white"
    >
      ✕
    </button>
  );
}

// Popup shell: bottom sheet on phones, centered dialog on larger screens.
// Closes on Escape or when the dark background is clicked.
function Modal({ label, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-[#26344e] bg-[#0d1629] p-5 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        {children}
      </div>
    </div>
  );
}

/* =========================
   PAGE
========================= */

export default function Dashboard() {
  const navigate = useNavigate();

  // ----- data from the backend -----
  const [dashStats, setDashStats] = useState(null); // result of GET /api/dashboard
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);

  // ----- page state -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----- UI state -----
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  // Which popup is open: { type: "ticket" | "project", id } or null.
  const [modal, setModal] = useState(null);

  const openTicket = (id) => setModal({ type: "ticket", id });
  const openProject = (id) => setModal({ type: "project", id });
  const closeModal = useCallback(() => setModal(null), []);

  // Logged-in user's id and organization name, read once from storage.
  const me = useMemo(() => {
    const user = tokenStorage.getUser?.() || {};
    return {
      id: user.user_id ?? user.id ?? user.sub ?? null,
      org:
        user.organization_name ??
        user.organization?.name ??
        user.org_name ??
        "",
    };
  }, []);

  // Loads everything the dashboard needs in parallel.
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // If only the stats call fails, the cards fall back to counting the tickets.
      const statsRequest = fetchDashboardStats().catch((err) => {
        // 401 = session expired: clear login and go back to the sign-in page.
        if (err.status === 401) {
          tokenStorage.clearSession?.();
          navigate("/", { replace: true });
        }
        return null;
      });

      const [t, p, s, pr, e, dash] = await Promise.all([
        getTickets(),
        getProjects(),
        getStatuses(),
        getPriorities(),
        getEmployees(),
        statsRequest,
      ]);

      setDashStats(dash);
      setTickets(getArray(t, ["tickets"]));
      setProjects(getArray(p, ["projects"]));
      setStatuses(getArray(s, ["statuses"]));
      setPriorities(getArray(pr, ["priorities"]));
      setEmployees(getArray(e, ["employees"]));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ----- lookups: turn ids into readable names ----- */

  const statusName = useCallback(
    (ticket) => {
      if (typeof ticket.status === "string") return ticket.status;
      return (
        ticket.status?.name ||
        statuses.find((s) => String(s.status_id) === String(ticket.status_id))
          ?.name ||
        "Unknown"
      );
    },
    [statuses]
  );

  const priorityName = useCallback(
    (ticket) => {
      if (typeof ticket.priority === "string") return ticket.priority;
      return (
        ticket.priority?.name ||
        priorities.find(
          (p) => String(p.priority_id) === String(ticket.priority_id)
        )?.name ||
        "Unknown"
      );
    },
    [priorities]
  );

  const projectName = useCallback(
    (ticket) => {
      const project = projects.find(
        (p) => String(p.project_id) === String(ticket.project_id)
      );
      return (
        ticket.project?.name ||
        ticket.project?.project_name ||
        project?.name ||
        project?.project_name ||
        "Unknown project"
      );
    },
    [projects]
  );

  // "Unassigned", "You" for the logged-in user, or the employee's name.
  const employeeName = useCallback(
    (userId) => {
      if (!userId) return "Unassigned";
      if (me.id && String(userId) === String(me.id)) return "You";
      const employee = employees.find(
        (e) => String(e.user_id) === String(userId)
      );
      return employee?.name || "Unknown member";
    },
    [employees, me.id]
  );

  // Project members can be objects, ids or strings; this returns a display name for any of them.
  const memberName = useCallback(
    (member) => {
      if (member && typeof member === "object") {
        const direct =
          member.name ?? member.full_name ?? member.user?.name ?? member.email;
        if (direct) return direct;
      }
      const id =
        typeof member === "string"
          ? member
          : member?.user_id ?? member?.id ?? member?.user?.id;
      return id ? employeeName(id) : "Unknown member";
    },
    [employeeName]
  );

  /* ----- derived data ----- */

  // Each ticket with all its display values worked out once.
  const enriched = useMemo(
    () =>
      tickets.map((ticket) => {
        const status = statusName(ticket);
        const key = normalize(status);
        const done = key === "resolved" || key === "closed";
        const due = timeOf(ticket.due_date);

        return {
          id: ticketId(ticket),
          number: ticketNumber(ticket),
          title: ticket.title || "Untitled ticket",
          description: ticket.description || "",
          projectId: ticket.project_id ?? ticket.project?.project_id ?? null,
          project: projectName(ticket),
          status,
          statusKey: key,
          done,
          priority: priorityName(ticket),
          assigneeId: ticket.assigned_to,
          assignee: employeeName(ticket.assigned_to),
          createdBy: ticket.created_by ? employeeName(ticket.created_by) : "—",
          due: ticket.due_date,
          // Overdue = has a due date before today and is not finished yet.
          overdue: Boolean(due) && !done && due < startOfToday(),
          createdAtRaw: ticket.created_at,
          updatedAtRaw: ticket.updated_at,
          createdAt: timeOf(ticket.created_at),
        };
      }),
    [tickets, statusName, projectName, priorityName, employeeName]
  );

  // The four summary cards.
  // Counts come from GET /api/dashboard; if that call failed they are counted
  // from the ticket list instead. Overdue is not in the API, so it is always
  // worked out from the tickets.
  const stats = useMemo(() => {
    const count = (fn) => enriched.filter(fn).length;

    const open = pick(
      dashStats?.openTickets,
      count((t) => t.statusKey === "open")
    );
    const inProgress = pick(
      dashStats?.inProgressTickets,
      count((t) => t.statusKey.includes("progress"))
    );
    const resolved = pick(
      dashStats?.resolvedTickets,
      count((t) => t.statusKey === "resolved")
    );
    const closed = pick(
      dashStats?.closedTickets,
      count((t) => t.statusKey === "closed")
    );
    const total = pick(dashStats?.totalTickets, enriched.length);

    const overdue = count((t) => t.overdue);
    const assignedInProgress = count(
      (t) => t.statusKey.includes("progress") && t.assigneeId
    );

    return [
      {
        label: "Open tickets",
        value: open,
        note: `of ${total} total`,
        noteColor: "text-slate-500",
        accent: "bg-blue-500",
      },
      {
        label: "In progress",
        value: inProgress,
        note: `${assignedInProgress} assigned`,
        noteColor: "text-slate-500",
        accent: "bg-amber-400",
      },
      {
        label: "Resolved",
        value: resolved,
        note: `${closed} closed`,
        noteColor: "text-emerald-400",
        accent: "bg-emerald-400",
      },
      {
        label: "Overdue",
        value: overdue,
        note: overdue ? "Needs attention" : "All on track",
        noteColor: overdue ? "text-rose-400" : "text-emerald-400",
        accent: "bg-rose-500",
      },
    ];
  }, [enriched, dashStats]);

  // Totals shown as chips under the page title.
  const totals = useMemo(
    () => ({
      tickets: pick(dashStats?.totalTickets, tickets.length),
      projects: pick(dashStats?.totalProjects, projects.length),
      employees: pick(dashStats?.totalEmployees, employees.length),
    }),
    [dashStats, tickets, projects, employees]
  );

  // The Overdue card is the 4th item; the bell icon reuses its number.
  const overdueCount = stats[3].value;

  // "By priority": tickets per priority with percentages.
  const priority = useMemo(() => {
    // Use the priorities list so priorities with 0 tickets still show.
    const names = priorities.length
      ? priorities.map((p) => p.name)
      : [...new Set(enriched.map((t) => t.priority))];

    const counted = names.map((name) => ({
      name,
      count: enriched.filter((t) => normalize(t.priority) === normalize(name))
        .length,
      color: priorityBarColor(name),
    }));

    const total = counted.reduce((sum, r) => sum + r.count, 0);

    return {
      total,
      rows: counted.map((r) => ({
        ...r,
        percent: total ? Math.round((r.count / total) * 100) : 0,
      })),
    };
  }, [priorities, enriched]);

  // "Team load": active (not resolved/closed) tickets per assignee, busiest first.
  const team = useMemo(() => {
    const map = new Map();

    enriched
      .filter((t) => !t.done && t.assigneeId)
      .forEach((t) => {
        const key = String(t.assigneeId);
        const row = map.get(key) || { id: key, active: 0, open: 0, progress: 0, overdue: 0 };
        row.active += 1;
        if (t.statusKey === "open") row.open += 1;
        if (t.statusKey.includes("progress")) row.progress += 1;
        if (t.overdue) row.overdue += 1;
        map.set(key, row);
      });

    const rows = [...map.values()]
      .map((row) => {
        const name = employeeName(row.id);
        return { ...row, name, initials: initialsOf(name), color: colorFor(name) };
      })
      .sort((a, b) => b.active - a.active)
      .slice(0, 6);

    return {
      rows,
      max: Math.max(1, ...rows.map((r) => r.active)), // widest bar = busiest person
      unassigned: enriched.filter((t) => !t.done && !t.assigneeId).length,
    };
  }, [enriched, employeeName]);

  // Recent tickets: newest first, filtered by the search box.
  const recentTickets = useMemo(() => {
    const query = search.toLowerCase().trim();

    return [...enriched]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((t) =>
        `${t.number} ${t.title} ${t.project} ${t.assignee}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, query ? 10 : 6);
  }, [enriched, search]);

  // Each project with its ticket counts and progress.
  const projectCards = useMemo(
    () =>
      projects.map((p) => {
        const id = p.project_id ?? p.id;
        const mine = enriched.filter((t) => String(t.projectId) === String(id));
        const done = mine.filter((t) => t.done).length;
        const rawMembers = p.members ?? p.project_members ?? p.member_ids ?? [];

        return {
          id,
          name: p.name ?? p.project_name ?? "Untitled project",
          description: p.description ?? "",
          createdAt: p.created_at ?? p.createdAt ?? null,
          status: projectStatusOf(p.status ?? p.project_status),
          members: Array.isArray(rawMembers) ? rawMembers : [],
          tickets: mine,
          total: mine.length,
          done,
          active: mine.length - done,
          overdue: mine.filter((t) => t.overdue).length,
          progress: mine.length ? Math.round((done / mine.length) * 100) : 0,
        };
      }),
    [projects, enriched]
  );

  // Projects shown in the grid: newest first, filtered by the search box, max 6.
  const visibleProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return [...projectCards]
      .sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt))
      .filter((p) =>
        `${p.name} ${p.description} ${p.members.map(memberName).join(" ")}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 6);
  }, [projectCards, search, memberName]);

  // Items for the open popup (looked up by id so they stay up to date).
  const selectedTicket =
    modal?.type === "ticket"
      ? enriched.find((t) => String(t.id) === String(modal.id))
      : null;

  const selectedProject =
    modal?.type === "project"
      ? projectCards.find((p) => String(p.id) === String(modal.id))
      : null;

  // e.g. "Wednesday, 4 November 2026"
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Shared style for the "View all" links in panel headers.
  const viewAllClass =
    "shrink-0 rounded-lg border border-[#293752] px-3 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-[#1a2942] hover:text-blue-200";

  /* ----- render ----- */

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] text-[#f3f5fb]">
      {/* Top bar: search box + notifications bell */}
      <header className="mb-6 flex min-w-0 items-center gap-2 sm:gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#202943] bg-[#111b32] px-3.5 py-3 transition focus-within:border-[#536df5]">
          <span className="shrink-0 text-lg text-slate-500" aria-hidden="true">
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets, projects, people..."
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            aria-label="Search tickets, projects and people"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 text-xs text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </label>

        {/* Notifications */}
        <div className="relative flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => setShowNotifications((previous) => !previous)}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#202943] bg-[#111b32] text-slate-300 transition hover:bg-[#1a2743] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Red dot only when there are overdue tickets */}
            {overdueCount > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-[#111b32] bg-rose-500" />
            )}
          </button>

          {showNotifications && (
            <>
              {/* Invisible full-screen button: clicking outside closes the popup */}
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute right-0 top-14 z-30 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#283552] bg-[#111b32] shadow-xl">
                <div className="flex items-center justify-between gap-2 border-b border-[#202943] px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  {overdueCount > 0 && (
                    <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                      1 new
                    </span>
                  )}
                </div>

                {overdueCount > 0 ? (
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-100">
                        {overdueCount} overdue {overdueCount === 1 ? "ticket" : "tickets"}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                        These tickets are past their due date and need attention.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="px-4 py-6 text-center text-xs text-slate-400">
                    You're all caught up.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Page title (left) and totals (right; wraps below on small screens) */}
      <section className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
          <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">
            {me.org ? `${me.org} · ` : ""}
            {todayLabel}
          </p>
        </div>

        {!loading && (
          <div className="flex flex-wrap gap-2">
            <Chip value={totals.tickets} label={totals.tickets === 1 ? "ticket" : "tickets"} />
            <Chip value={totals.projects} label={totals.projects === 1 ? "project" : "projects"} />
            <Chip value={totals.employees} label={totals.employees === 1 ? "employee" : "employees"} />
          </div>
        )}
      </section>

      {/* Error banner with a retry button */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="rounded-lg border border-rose-400/40 px-3 py-1.5 font-semibold hover:bg-rose-500/10"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary cards: 2 per row on phones, 4 in a row on large screens */}
      <section className="mb-6 grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </section>

      {/* Main area: recent tickets (left) and priority + team (right) */}
      <section className="mb-6 grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)]">
        {/* Recent tickets */}
        <Panel
          title="Recent tickets"
          subtitle="Click a ticket to see its details"
          action={
            <Link to="/tickets" className={viewAllClass}>
              View all
            </Link>
          }
        >
          {loading ? (
            <SkeletonRows rows={5} />
          ) : recentTickets.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-slate-400">
              {tickets.length === 0
                ? "No tickets yet."
                : "No tickets match your search."}
            </p>
          ) : (
            <>
              {/* Mobile: one tappable card per ticket (hidden on md and up) */}
              <div className="divide-y divide-[#202943] md:hidden">
                {recentTickets.map((ticket) => (
                  <button
                    key={ticket.id ?? ticket.number}
                    type="button"
                    onClick={() => openTicket(ticket.id)}
                    className="block w-full min-w-0 p-4 text-left transition hover:bg-[#16233f]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-[11px] text-slate-500">{ticket.number}</span>
                      <StatusBadge status={ticket.status} />
                    </div>

                    <h3 className="break-words text-sm font-semibold leading-relaxed text-slate-100">
                      {ticket.title}
                    </h3>

                    <p className="mt-1 break-words text-xs text-slate-500">{ticket.project}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <PriorityBadge priority={ticket.priority} />

                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar
                          initials={initialsOf(ticket.assignee)}
                          color={colorFor(ticket.assignee)}
                        />
                        <span className="max-w-[130px] truncate text-xs text-slate-300">
                          {ticket.assignee}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#202943] pt-3 text-xs">
                      <span className="text-slate-500">Due date</span>
                      <span className={ticket.overdue ? "text-rose-300" : "text-slate-300"}>
                        {formatShortDate(ticket.due)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Desktop: table (hidden below md) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">ID</th>
                      <th className="px-3 py-3">Ticket</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Priority</th>
                      <th className="px-3 py-3">Assignee</th>
                      <th className="px-5 py-3">Due</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTickets.map((ticket) => (
                      <tr
                        key={ticket.id ?? ticket.number}
                        onClick={() => openTicket(ticket.id)}
                        className="cursor-pointer border-t border-[#202943]/80 transition hover:bg-[#172541]"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-[11px] text-slate-500">
                          {ticket.number}
                        </td>

                        <td className="max-w-[240px] px-3 py-4">
                          {/* A real button so keyboard users can open it too */}
                          <button
                            type="button"
                            onClick={() => openTicket(ticket.id)}
                            className="block max-w-full text-left"
                          >
                            <span className="block truncate text-xs font-semibold text-slate-100 hover:text-blue-300">
                              {ticket.title}
                            </span>
                            <span className="mt-1 block truncate text-[11px] text-slate-500">
                              {ticket.project}
                            </span>
                          </button>
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>

                        <td className="px-3 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar
                              initials={initialsOf(ticket.assignee)}
                              color={colorFor(ticket.assignee)}
                            />
                            <span className="whitespace-nowrap text-xs text-slate-300">
                              {ticket.assignee}
                            </span>
                          </div>
                        </td>

                        <td
                          className={`whitespace-nowrap px-5 py-4 text-xs ${
                            ticket.overdue ? "font-medium text-rose-300" : "text-slate-400"
                          }`}
                        >
                          {formatShortDate(ticket.due)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>

        {/* Right column: stacked on phones, side by side on tablets, stacked again on desktop */}
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
          {/* Tickets per priority */}
          <Panel title="By priority" subtitle={`${plural(priority.total, "ticket")} in total`}>
            <div className="p-4 sm:p-5">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : priority.rows.length === 0 ? (
                <p className="text-xs text-slate-500">No priority data.</p>
              ) : (
                <>
                  {/* One bar split into colored segments, sized by ticket count */}
                  <div className="mb-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[#081225]">
                    {priority.rows
                      .filter((r) => r.count > 0)
                      .map((r) => (
                        <div
                          key={r.name}
                          title={`${r.name}: ${r.count}`}
                          className={r.color}
                          style={{ width: `${(r.count / priority.total) * 100}%` }}
                        />
                      ))}
                  </div>

                  {/* Legend: dot, name, count and percentage */}
                  <ul className="space-y-3.5">
                    {priority.rows.map((r) => (
                      <li key={r.name} className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.color}`} />
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                          {r.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-100">{r.count}</span>
                        <span className="w-10 text-right text-[11px] text-slate-500">
                          {r.percent}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Panel>

          {/* Active tickets per person */}
          <Panel title="Team load" subtitle="Active tickets per person">
            <div className="p-4 sm:p-5">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : team.rows.length === 0 ? (
                <p className="text-xs text-slate-500">No assigned tickets yet.</p>
              ) : (
                <ul className="space-y-5">
                  {team.rows.map((member) => (
                    <li key={member.id} className="flex min-w-0 items-center gap-3">
                      <Avatar initials={member.initials} color={member.color} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium text-slate-200">
                            {member.name}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-slate-100">
                            {member.active}
                          </span>
                        </div>

                        {/* Bar width is relative to the busiest person */}
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#081225]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
                            style={{ width: `${(member.active / team.max) * 100}%` }}
                          />
                        </div>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {member.open} open · {member.progress} in progress
                          {member.overdue > 0 && (
                            <span className="text-rose-300"> · {member.overdue} overdue</span>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Tickets nobody owns yet */}
              {!loading && team.unassigned > 0 && (
                <p className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                  {plural(team.unassigned, "active ticket")} not assigned to anyone.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </section>

      {/* Projects: cards with progress; click one for details */}
      <Panel
        title="Projects"
        subtitle="Progress and team for each project"
        action={
          <Link to="/projects" className={viewAllClass}>
            View all
          </Link>
        }
      >
        {loading ? (
          <SkeletonRows rows={3} />
        ) : visibleProjects.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-400">
            {projects.length === 0
              ? "No projects yet."
              : "No projects match your search."}
          </p>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-3">
            {visibleProjects.map((project) => (
              <button
                key={project.id ?? project.name}
                type="button"
                onClick={() => openProject(project.id)}
                className="group min-w-0 rounded-xl border border-[#26344e] bg-[#0d172a] p-4 text-left transition hover:border-blue-500/50 hover:bg-[#101c34]"
              >
                {/* Name + optional status */}
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-slate-950 ${colorFor(project.name)}`}
                  >
                    {project.name.slice(0, 1).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white group-hover:text-blue-300">
                      {project.name}
                    </h3>
                    {project.status && (
                      <span
                        className={`mt-1 inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${project.status.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${project.status.dot}`} />
                        {project.status.label}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-500">
                  {project.description || "No description available."}
                </p>

                {/* Progress = finished tickets / all tickets in this project */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {project.done}/{project.total} done
                    </span>
                    <span className="font-semibold text-slate-200">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#081225]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Members + overdue warning */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member, index) => {
                        const name = memberName(member);
                        return (
                          <span
                            key={index}
                            title={name}
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0d172a] text-[10px] font-bold text-slate-950 ${colorFor(name)}`}
                          >
                            {initialsOf(name)}
                          </span>
                        );
                      })}
                    </div>
                    <span className="ml-2 text-[11px] text-slate-500">
                      {plural(project.members.length, "member")}
                    </span>
                  </div>

                  {project.overdue > 0 && (
                    <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                      {project.overdue} overdue
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <footer className="pt-8 text-center text-[11px] text-slate-600">
        Relay · Ticket Tracking Workspace
      </footer>

      {/* ===== TICKET DETAILS POPUP ===== */}
      {selectedTicket && (
        <Modal label="Ticket details" onClose={closeModal}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Ticket details
              </p>
              <h2 className="mt-1.5 break-words text-xl font-bold text-white">
                {selectedTicket.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500">{selectedTicket.number}</p>
            </div>
            <CloseButton onClick={closeModal} />
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <StatusBadge status={selectedTicket.status} />
            <PriorityBadge priority={selectedTicket.priority} />
            {selectedTicket.overdue && (
              <span className="rounded-md bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                Overdue
              </span>
            )}
          </div>

          <div className="mb-6 rounded-xl border border-[#26344e] bg-[#111a2d] p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Description
            </p>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
              {selectedTicket.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Project">
              {/* Jump from the ticket to its project popup */}
              {selectedTicket.projectId != null &&
              projectCards.some((p) => String(p.id) === String(selectedTicket.projectId)) ? (
                <button
                  type="button"
                  onClick={() => openProject(selectedTicket.projectId)}
                  className="text-left font-medium text-blue-300 hover:underline"
                >
                  {selectedTicket.project}
                </button>
              ) : (
                selectedTicket.project
              )}
            </Field>
            <Field label="Assigned to">{selectedTicket.assignee}</Field>
            <Field label="Created by">{selectedTicket.createdBy}</Field>
            <Field label="Due date">
              <span className={selectedTicket.overdue ? "text-rose-300" : ""}>
                {formatDate(selectedTicket.due)}
              </span>
            </Field>
            <Field label="Created">{formatDateTime(selectedTicket.createdAtRaw)}</Field>
            <Field label="Last updated">{formatDateTime(selectedTicket.updatedAtRaw)}</Field>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#26344e] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
            <Link
              to="/tickets"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-500"
            >
              Manage in Tickets
            </Link>
          </div>
        </Modal>
      )}

      {/* ===== PROJECT DETAILS POPUP ===== */}
      {selectedProject && (
        <Modal label="Project details" onClose={closeModal}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-slate-950 ${colorFor(selectedProject.name)}`}
              >
                {selectedProject.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                  Project details
                </p>
                <h2 className="mt-1 break-words text-xl font-bold text-white">
                  {selectedProject.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Created {formatDate(selectedProject.createdAt)}
                </p>
              </div>
            </div>
            <CloseButton onClick={closeModal} />
          </div>

          {selectedProject.status && (
            <span
              className={`mb-4 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${selectedProject.status.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${selectedProject.status.dot}`} />
              {selectedProject.status.label}
            </span>
          )}

          <p className="mb-6 text-sm leading-6 text-slate-300">
            {selectedProject.description || "No description available."}
          </p>

          {/* Quick numbers */}
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Tickets", value: selectedProject.total, color: "text-white" },
              { label: "Active", value: selectedProject.active, color: "text-amber-300" },
              { label: "Done", value: selectedProject.done, color: "text-emerald-300" },
              { label: "Overdue", value: selectedProject.overdue, color: "text-rose-300" },
            ].map((tile) => (
              <div
                key={tile.label}
                className="rounded-xl border border-[#26344e] bg-[#111a2d] px-3 py-3 text-center"
              >
                <p className={`text-xl font-bold ${tile.color}`}>{tile.value}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{tile.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Progress</span>
              <span className="font-semibold text-slate-200">{selectedProject.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#081225]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                style={{ width: `${selectedProject.progress}%` }}
              />
            </div>
          </div>

          {/* Members */}
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Members ({selectedProject.members.length})
          </p>
          {selectedProject.members.length === 0 ? (
            <p className="mb-6 text-sm text-slate-500">No members assigned.</p>
          ) : (
            <ul className="mb-6 grid gap-2 sm:grid-cols-2">
              {selectedProject.members.map((member, index) => {
                const name = memberName(member);
                return (
                  <li
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-[#26344e] bg-[#111a2d] px-3 py-2"
                  >
                    <Avatar initials={initialsOf(name)} color={colorFor(name)} />
                    <span className="truncate text-sm text-white">{name}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Tickets in this project (click to open one) */}
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Tickets in this project
          </p>
          {selectedProject.tickets.length === 0 ? (
            <p className="text-sm text-slate-500">No tickets yet.</p>
          ) : (
            <ul className="space-y-2">
              {[...selectedProject.tickets]
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 8)
                .map((ticket) => (
                  <li key={ticket.id ?? ticket.number}>
                    <button
                      type="button"
                      onClick={() => openTicket(ticket.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-[#26344e] bg-[#111a2d] px-3 py-2.5 text-left transition hover:border-blue-500/50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-100">
                          {ticket.title}
                        </span>
                        <span className="block text-[11px] text-slate-500">{ticket.number}</span>
                      </span>
                      <StatusBadge status={ticket.status} />
                    </button>
                  </li>
                ))}
              {selectedProject.tickets.length > 8 && (
                <li className="pt-1 text-center text-[11px] text-slate-500">
                  +{selectedProject.tickets.length - 8} more in the Tickets page
                </li>
              )}
            </ul>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#26344e] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
            <Link
              to="/projects"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-500"
            >
              Manage in Projects
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
