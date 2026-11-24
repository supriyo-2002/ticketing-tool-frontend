
import { useEffect, useMemo, useState } from "react";
import Skeleton from "../components/Skeleton";
import { getProjects } from "../api/project.js";
import {
  getTickets,
  createTicket as createTicketAPI,
  updateTicket as updateTicketAPI,
  deleteTicket,
} from "../api/tickets.js";
import { workspaceStore } from "../services/workspaceStore";
import { getStatuses } from "../api/statuses.js";
import { getPriorities } from "../api/priorities.js";
import { getEmployees } from "../api/employees.js";

const initialForm = {
  project_id: "",
  title: "",
  description: "",
  status_id: "",
  priority_id: "",
  assigned_to: "",
  due_date: "",
};

function getArray(response, keys = []) {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;

  for (const key of keys) {
    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }
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

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInputDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

/* =========================
   SKELETON
========================= */


function TicketsPageSkeleton() {
  const tabs = ["All", "Open", "In Progress", "Resolved", "Closed"];

  return (
    <div className="w-full min-w-0 space-y-7 text-[#f3f5fb]">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Tickets
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Loading tickets...
          </p>
        </div>

        <button
          disabled
          className="shrink-0 rounded-xl bg-blue-600 px-6 py-4
          text-sm font-semibold text-white opacity-90"
        >
          + New ticket
        </button>
      </div>

      {/* STATUS TABS */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            disabled
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
              tab === "All"
                ? "border-blue-500 bg-blue-500/15 text-blue-300"
                : "border-[#243049] bg-[#0f1729] text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            className="h-14 w-full rounded-xl"
          />
        ))}
      </div>

      {/* SEARCH */}
      <Skeleton className="h-14 w-full rounded-xl" />

      {/* TICKET TABLE */}
      <section className="overflow-hidden rounded-2xl border border-[#26344e] bg-[#111a2d]">

        {/* TABLE HEADER */}
        <div className="flex items-center justify-between gap-3 border-b border-[#26344e] px-6 py-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              All tickets
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage and track your organization's tickets.
            </p>
          </div>

          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        {/* DESKTOP TABLE SKELETON */}
        <div className="hidden md:block">

          {/* TABLE COLUMNS */}
          <div className="grid grid-cols-8 gap-4 border-b border-[#26344e] bg-[#0e192d] px-6 py-4">
            {[
              "Ticket ID",
              "Ticket",
              "Project",
              "Status",
              "Priority",
              "Assignee",
              "Due date",
              "Actions",
            ].map((heading) => (
              <span
                key={heading}
                className="text-xs font-semibold text-slate-500"
              >
                {heading}
              </span>
            ))}
          </div>

          {/* LOADING ROWS */}
          <div className="divide-y divide-[#26344e]">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="grid grid-cols-8 items-center gap-4 px-6 py-5"
              >
                <Skeleton className="h-4 w-16" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>

                <Skeleton className="h-4 w-20" />

                <Skeleton className="h-8 w-20 rounded-lg" />

                <Skeleton className="h-8 w-20 rounded-lg" />

                <Skeleton className="h-4 w-20" />

                <Skeleton className="h-4 w-20" />

                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE CARD SKELETON */}
        <div className="grid gap-3 p-4 md:hidden">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[#26344e] bg-[#0d172a] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>

                <Skeleton className="h-7 w-20 rounded-full" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#26344e] pt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-[#26344e] pt-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}

/* =========================
   ACTION ICONS
========================= */

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

  if (type === "edit") {
    return (
      <svg {...common}>
        <path d="m15 5 4 4" />
        <path d="M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" />
      </svg>
    );
  }

  if (type === "delete") {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </svg>
    );
  }

  return null;
}

/* =========================
   BADGES
========================= */

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let style = "bg-slate-700/50 text-slate-300";

  if (normalized === "open") {
    style = "bg-blue-500/15 text-blue-300";
  } else if (normalized.includes("progress")) {
    style = "bg-amber-500/15 text-amber-300";
  } else if (normalized === "resolved") {
    style = "bg-emerald-500/15 text-emerald-300";
  } else if (normalized === "closed") {
    style = "bg-slate-600/30 text-slate-300";
  }

  return (
    <span className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${style}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const normalized = String(priority || "").toLowerCase();

  let style = "bg-slate-700/50 text-slate-300";

  if (normalized === "critical") {
    style = "bg-rose-500/15 text-rose-300";
  } else if (normalized === "high") {
    style = "bg-red-500/15 text-red-300";
  } else if (normalized === "medium") {
    style = "bg-amber-500/15 text-amber-300";
  } else if (normalized === "low") {
    style = "bg-blue-500/15 text-blue-300";
  }

  return (
    <span className={`inline-flex whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ${style}`}>
      {priority || "Unknown"}
    </span>
  );
}

/* =========================
   MAIN PAGE
========================= */

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusTab, setStatusTab] = useState("All");

  const [form, setForm] = useState(initialForm);

  // const loadData = async (showLoader = true) => {
  //   if (showLoader) setLoading(true);
  //   setPageError("");

  //   try {
  //     const [
  //       ticketResponse,
  //       projectResponse,
  //       statusResponse,
  //       priorityResponse,
  //       employeeResponse,
  //     ] = await Promise.all([
  //       getTickets(),
  //       getProjects(),
  //       getStatuses(),
  //       getPriorities(),
  //       getEmployees(),
  //     ]);

  //     setTickets(getArray(ticketResponse, ["tickets"]));
  //     setProjects(getArray(projectResponse, ["projects"]));
  //     setStatuses(getArray(statusResponse, ["statuses"]));
  //     setPriorities(getArray(priorityResponse, ["priorities"]));
  //     setEmployees(getArray(employeeResponse, ["employees"]));
  //   } catch (error) {
  //     setPageError(getErrorMessage(error));
  //   } finally {
  //     if (showLoader) setLoading(false);
  //   }
  // };
const loadData = async (showLoader = true) => {
  if (showLoader) setLoading(true);
  setPageError("");

  try {
    const [ticketList, projectList, statusList, priorityList, employeeList] =
      await Promise.all([
        workspaceStore.loadTickets(),
        workspaceStore.loadProjects(),
        workspaceStore.loadStatuses(),
        workspaceStore.loadPriorities(),
        workspaceStore.loadEmployees(),
      ]);

    setTickets(ticketList);
    setProjects(projectList);
    setStatuses(statusList);
    setPriorities(priorityList);
    setEmployees(employeeList);
  } catch (error) {
    setPageError(getErrorMessage(error));
  } finally {
    if (showLoader) setLoading(false);
  }
};
  useEffect(() => {
    loadData();
  }, []);

  const getTicketId = (ticket) =>
    ticket?.ticket_id ?? ticket?.id;

  const getEmployeeName = (userId) => {
    if (!userId) return "Unassigned";

    const employee = employees.find(
      (item) => String(item.user_id) === String(userId)
    );

    return employee?.name || "Employee not found";
  };

  const getStatusName = (ticket) => {
    if (typeof ticket.status === "string") return ticket.status;

    return (
      ticket.status?.name ||
      statuses.find(
        (item) => String(item.status_id) === String(ticket.status_id)
      )?.name ||
      "Unknown"
    );
  };

  const getPriorityName = (ticket) => {
    if (typeof ticket.priority === "string") return ticket.priority;

    return (
      ticket.priority?.name ||
      priorities.find(
        (item) => String(item.priority_id) === String(ticket.priority_id)
      )?.name ||
      "Unknown"
    );
  };

  const getProjectName = (ticket) => {
    const project = projects.find(
      (item) => String(item.project_id) === String(ticket.project_id)
    );

    return (
      ticket.project?.name ||
      ticket.project?.project_name ||
      project?.name ||
      project?.project_name ||
      "Unknown"
    );
  };

  const getTicketNumber = (ticket) => {
    const id = getTicketId(ticket);

    return (
      ticket.ticket_number ||
      ticket.ticket_code ||
      (id != null ? `TCK-${String(id).slice(0, 8)}` : "—")
    );
  };

  const getOrganizationName = (ticket) =>
    ticket.organization?.name ||
    ticket.organization?.organization_name ||
    ticket.organization_name ||
    "Organization name unavailable";

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        [
          ticket.ticket_number,
          ticket.ticket_code,
          ticket.title,
          ticket.description,
          getProjectName(ticket),
          getEmployeeName(ticket.assigned_to),
          getStatusName(ticket),
          getPriorityName(ticket),
        ].some((value) =>
          String(value || "").toLowerCase().includes(searchText)
        );

      const matchesStatus =
        !statusFilter ||
        String(ticket.status_id) === String(statusFilter) ||
        String(ticket.status?.status_id) === String(statusFilter);

      const matchesPriority =
        !priorityFilter ||
        String(ticket.priority_id) === String(priorityFilter) ||
        String(ticket.priority?.priority_id) === String(priorityFilter);

      const matchesProject =
        !projectFilter ||
        String(ticket.project_id) === String(projectFilter) ||
        String(ticket.project?.project_id) === String(projectFilter);

      const normalizedStatus = getStatusName(ticket).toLowerCase().trim();

      const matchesTab =
        statusTab === "All" ||
        (statusTab === "Open" && normalizedStatus === "open") ||
        (statusTab === "In Progress" &&
          ["in progress", "in-progress", "in_progress"].includes(normalizedStatus)) ||
        (statusTab === "Resolved" && normalizedStatus === "resolved") ||
        (statusTab === "Closed" && normalizedStatus === "closed");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesProject &&
        matchesTab
      );
    });
  }, [
    tickets,
    projects,
    statuses,
    priorities,
    employees,
    search,
    statusFilter,
    priorityFilter,
    projectFilter,
    statusTab,
  ]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingTicket(null);
    setForm(initialForm);
    setPageError("");
    setModalOpen(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);

    setForm({
      project_id: ticket.project_id ?? ticket.project?.project_id ?? "",
      title: ticket.title || "",
      description: ticket.description || "",
      status_id: ticket.status_id ?? ticket.status?.status_id ?? "",
      priority_id: ticket.priority_id ?? ticket.priority?.priority_id ?? "",
      assigned_to: ticket.assigned_to ?? "",
      due_date: getInputDate(ticket.due_date),
    });

    setSelectedTicket(null);
    setPageError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingTicket(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPageError("");
    setSuccessMessage("");

    if (!form.project_id || !form.status_id || !form.priority_id) {
      setPageError("Please select a project, status, and priority.");
      return;
    }

    if (!form.title.trim()) {
      setPageError("Please enter a ticket title.");
      return;
    }

    const payload = {
      project_id: form.project_id,
      title: form.title.trim(),
      description: form.description.trim(),
      status_id: form.status_id,
      priority_id: form.priority_id,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date || null,
    };

    setSubmitting(true);

    try {
      if (editingTicket) {
        const ticketId = getTicketId(editingTicket);

        if (ticketId == null) {
          throw new Error("Ticket ID is missing.");
        }

        await updateTicketAPI(ticketId, payload);
        setSuccessMessage("Ticket updated successfully.");
      } else {
        await createTicketAPI(payload);
        setSuccessMessage("Ticket created successfully.");
      }

      setModalOpen(false);
      setEditingTicket(null);
      setForm(initialForm);

      await loadData(false);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async (ticket) => {
    const ticketId = getTicketId(ticket);

    if (ticketId == null || ticketId === "") {
      setPageError("Ticket ID is missing.");
      return;
    }

    if (!window.confirm(`Delete "${ticket.title || "this ticket"}"?`)) {
      return;
    }

    setPageError("");
    setSuccessMessage("");
    setDeletingId(ticketId);

    try {
      await deleteTicket(ticketId);

      setTickets((previous) =>
        previous.filter(
          (item) => String(getTicketId(item)) !== String(ticketId)
        )
      );

      setSelectedTicket(null);
      setSuccessMessage("Ticket deleted successfully.");
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  // const inputClass =
  //   "h-14 w-full min-w-0 rounded-xl border border-[#26344e] bg-[#111a2d] px-5 py-3 text-base text-slate-100 outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
   const inputClass =
  "h-12 w-full min-w-0 rounded-xl border border-[#26344e] bg-[#111a2d] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-400";

  const actionButtonClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#26344e] bg-[#111a2d] text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-300";

  const deleteButtonClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#26344e] bg-[#111a2d] text-slate-300 transition hover:border-rose-500 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-40";

  const tabs = ["All", "Open", "In Progress", "Resolved", "Closed"];

  return (
    
  <div className="relative isolate w-full min-w-0 text-[#f3f5fb]">
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#080d18]" />

    {/* <main className="relative z-10 w-full min-w-0 px-2 pt-3 pb-6 sm:px-3 sm:pt-4 sm:pb-8 lg:px-4 lg:pt-4 lg:pb-10"> */}
    <main className="relative z-10 m-0 w-full min-w-0 p-0">

        {/* CORRECT LOADING CONDITION */}
        {loading ? (
          <TicketsPageSkeleton />
        ) : (
          <>
            {/* HEADER */}
            <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-3xl">
                  Tickets
                </h1>

                <p className="mt-1.5 text-sm text-slate-400 sm:text-base">
                  {tickets.length} tickets across {projects.length} projects
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 sm:w-auto"
              >
                + New ticket
              </button>
            </div>

            {/* NOTIFICATIONS */}
            {pageError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-3 text-sm text-rose-300"
              >
                {pageError}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300"
              >
                {successMessage}
              </div>
            )}

            {/* STATUS TABS */}
            {/* <div className="mb-7 flex min-w-0 gap-3 overflow-x-auto pb-1 sm:mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  aria-pressed={statusTab === tab}
                  className={`shrink-0 rounded-xl border px-5 py-3 text-sm font-semibold transition sm:px-6 sm:py-3.5 sm:text-base ${
                    statusTab === tab
                      ? "border-blue-600 bg-blue-600/15 text-blue-400"
                      : "border-[#202b43] bg-[#111a2d] text-slate-400 hover:bg-[#17233b] hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div> */}

{/* STATUS TABS - MATCH PROJECTS PAGE UI */}
<div className="mb-6 flex min-w-0 flex-wrap items-center gap-2">
  {tabs.map((tab) => {
    const active = statusTab === tab;

    const dotColor = {
      All: "bg-blue-400",
      Open: "bg-blue-400",
      "In Progress": "bg-amber-400",
      Resolved: "bg-emerald-400",
      Closed: "bg-slate-400",
    };

    const activeStyle = {
      All: "border-blue-500 bg-blue-500/15 text-blue-300",
      Open: "border-blue-500 bg-blue-500/15 text-blue-300",
      "In Progress": "border-amber-500 bg-amber-500/15 text-amber-300",
      Resolved: "border-emerald-500 bg-emerald-500/15 text-emerald-300",
      Closed: "border-slate-500 bg-slate-500/15 text-slate-300",
    };

    return (
      <button
        key={tab}
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => setStatusTab(tab)}
        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
          active
            ? activeStyle[tab]
            : "border-[#243049] bg-[#0f1729] text-slate-300 hover:bg-[#16213a]"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${dotColor[tab]}`}
        />
        {tab}
      </button>
    );
  })}
</div>


            {/* FILTERS */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
              <select
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                className={inputClass}
                aria-label="Filter by project"
              >
                <option value="">All projects</option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name || project.project_name || "Unnamed project"}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={inputClass}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status.status_id} value={status.status_id}>
                    {status.name}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className={inputClass}
                aria-label="Filter by priority"
              >
                <option value="">All priorities</option>
                {priorities.map((priority) => (
                  <option key={priority.priority_id} value={priority.priority_id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH */}
            <div className="mb-7 sm:mb-8">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets, descriptions, projects, members..."
                className={inputClass}
                aria-label="Search tickets"
              />
            </div>

            {/* TICKET TABLE CARD */}
            <section className="overflow-hidden rounded-2xl border border-[#26344e] bg-[#111a2d] shadow-xl shadow-black/10">
              <div className="flex items-center justify-between gap-3 border-b border-[#26344e] px-5 py-5 sm:px-6 sm:py-6">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    All tickets
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Manage and track your organization's tickets.
                  </p>
                </div>

                <span className="shrink-0 rounded-xl border border-[#26344e] bg-[#0d172a] px-4 py-3 text-sm text-slate-400">
                  {filteredTickets.length} displayed
                </span>
              </div>

              {filteredTickets.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#26344e] bg-[#0d172a] text-2xl text-slate-500">
                    <ActionIcon type="view" size={24} />
                  </div>

                  <h3 className="text-base font-semibold text-white">
                    {tickets.length === 0
                      ? "No tickets found"
                      : "No matching tickets"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {tickets.length === 0
                      ? "Create your first ticket to get started."
                      : "Try changing your search or filters."}
                  </p>
                </div>
              ) : (
                <>
                  {/* MOBILE CARDS */}
                  <div className="grid gap-3 p-4 md:hidden">
                    {filteredTickets.map((ticket) => {
                      const ticketId = getTicketId(ticket);

                      return (
                        <article
                          key={ticketId}
                          className="rounded-xl border border-[#26344e] bg-[#0d172a] p-4 transition hover:border-[#3b5278] sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="mb-1.5 text-xs text-slate-500">
                                {getTicketNumber(ticket)}
                              </p>

                              <h3 className="break-words text-base font-semibold text-white">
                                {ticket.title || "Untitled ticket"}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {getProjectName(ticket)}
                              </p>
                            </div>

                            <StatusBadge status={getStatusName(ticket)} />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#26344e] pt-4">
                            <div>
                              <p className="mb-1.5 text-xs text-slate-500">
                                Priority
                              </p>
                              <PriorityBadge priority={getPriorityName(ticket)} />
                            </div>

                            <div>
                              <p className="mb-1.5 text-xs text-slate-500">
                                Assignee
                              </p>
                              <p className="break-words text-sm text-slate-300">
                                {getEmployeeName(ticket.assigned_to)}
                              </p>
                            </div>

                            <div>
                              <p className="mb-1.5 text-xs text-slate-500">
                                Due date
                              </p>
                              <p className="text-sm text-slate-300">
                                {formatDate(ticket.due_date)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2 border-t border-[#26344e] pt-4">
                            <button
                              type="button"
                              onClick={() => setSelectedTicket(ticket)}
                              title="View ticket"
                              aria-label="View ticket"
                              className={actionButtonClass}
                            >
                              <ActionIcon type="view" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(ticket)}
                              title="Edit ticket"
                              aria-label="Edit ticket"
                              className={actionButtonClass}
                            >
                              <ActionIcon type="edit" />
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === ticketId}
                              onClick={() => handleDeleteTicket(ticket)}
                              title="Delete ticket"
                              aria-label="Delete ticket"
                              className={deleteButtonClass}
                            >
                              {deletingId === ticketId ? "…" : <ActionIcon type="delete" />}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                      <thead className="border-b border-[#26344e] bg-[#0e192d] text-sm text-slate-400">
                        <tr>
                          <th className="px-6 py-5 font-medium">Ticket ID</th>
                          <th className="px-6 py-5 font-medium">Ticket</th>
                          <th className="px-6 py-5 font-medium">Project</th>
                          <th className="px-6 py-5 font-medium">Status</th>
                          <th className="px-6 py-5 font-medium">Priority</th>
                          <th className="px-6 py-5 font-medium">Assignee</th>
                          <th className="px-6 py-5 font-medium">Due date</th>
                          <th className="px-6 py-5 text-center font-medium">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#26344e]">
                        {filteredTickets.map((ticket) => {
                          const ticketId = getTicketId(ticket);

                          return (
                            <tr
                              key={ticketId}
                              className="transition hover:bg-[#17233b]/80"
                            >
                              <td className="whitespace-nowrap px-6 py-5 text-xs text-slate-500">
                                {getTicketNumber(ticket)}
                              </td>

                              <td className="max-w-[280px] px-6 py-5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="block max-w-full text-left"
                                >
                                  <span className="block break-words font-semibold text-slate-200 hover:text-blue-300">
                                    {ticket.title || "Untitled ticket"}
                                  </span>
                                  <span className="mt-1.5 block text-xs text-slate-500">
                                    {ticket.description || "No description"}
                                  </span>
                                </button>
                              </td>

                              <td className="px-6 py-5 text-sm text-slate-300">
                                {getProjectName(ticket)}
                              </td>

                              <td className="px-6 py-5">
                                <StatusBadge status={getStatusName(ticket)} />
                              </td>

                              <td className="px-6 py-5">
                                <PriorityBadge priority={getPriorityName(ticket)} />
                              </td>

                              <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-300">
                                {getEmployeeName(ticket.assigned_to)}
                              </td>

                              <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-400">
                                {formatDate(ticket.due_date)}
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTicket(ticket)}
                                    title="View ticket"
                                    aria-label="View ticket"
                                    className={actionButtonClass}
                                  >
                                    <ActionIcon type="view" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openEditModal(ticket)}
                                    title="Edit ticket"
                                    aria-label="Edit ticket"
                                    className={actionButtonClass}
                                  >
                                    <ActionIcon type="edit" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={deletingId === ticketId}
                                    onClick={() => handleDeleteTicket(ticket)}
                                    title="Delete ticket"
                                    aria-label="Delete ticket"
                                    className={deleteButtonClass}
                                  >
                                    {deletingId === ticketId
                                      ? "…"
                                      : <ActionIcon type="delete" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* TICKET DETAILS MODAL */}
            {selectedTicket && (
              <div
                className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto bg-black/70 p-0 sm:items-center sm:p-4"
                onClick={() => setSelectedTicket(null)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
                  className="my-auto max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-[#26344e] bg-[#0d1629] p-5 shadow-2xl sm:rounded-2xl sm:p-7"
                >
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                        Ticket details
                      </p>
                      <h2 className="mt-2 break-words text-xl font-bold text-white">
                        {selectedTicket.title || "Untitled ticket"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {getTicketNumber(selectedTicket)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      aria-label="Close details"
                      className="rounded-lg border border-[#26344e] px-3 py-1 text-xl text-slate-400 hover:bg-slate-800"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-6 rounded-xl border border-[#26344e] bg-[#111a2d] p-4">
                    <p className="mb-2 text-xs font-semibold text-slate-400">
                      Description
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
                      {selectedTicket.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Organization</p>
                      <p className="break-words text-sm text-slate-200">
                        {getOrganizationName(selectedTicket)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-slate-500">Project</p>
                      <p className="text-sm text-slate-200">
                        {getProjectName(selectedTicket)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-slate-500">Status</p>
                      <StatusBadge status={getStatusName(selectedTicket)} />
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-slate-500">Priority</p>
                      <PriorityBadge priority={getPriorityName(selectedTicket)} />
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-slate-500">Assigned to</p>
                      <p className="text-sm text-slate-200">
                        {getEmployeeName(selectedTicket.assigned_to)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-slate-500">Created by</p>
                      <p className="text-sm text-slate-200">
                        {getEmployeeName(selectedTicket.created_by)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-slate-500">Due date</p>
                      <p className="text-sm text-slate-200">
                        {formatDate(selectedTicket.due_date)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-slate-500">Created at</p>
                      <p className="text-sm text-slate-200">
                        {formatDateTime(selectedTicket.created_at)}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs text-slate-500">Last updated</p>
                      <p className="text-sm text-slate-200">
                        {formatDateTime(selectedTicket.updated_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#26344e] pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(selectedTicket)}
                      className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                      Edit ticket
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {modalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/75 p-0 sm:items-center sm:p-4"
                onClick={closeModal}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
                  className="my-auto max-h-[95dvh] w-full max-w-4xl overflow-y-auto rounded-t-2xl border border-[#26344e] bg-[#0c1528] p-5 shadow-2xl sm:rounded-2xl sm:p-7"
                >
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white sm:text-2xl">
                        {editingTicket ? "Edit ticket" : "Create new ticket"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {editingTicket
                          ? "Update ticket details and assignments."
                          : "Add ticket details and assign it to a project."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={submitting}
                      aria-label="Close modal"
                      className="rounded-lg border border-[#26344e] px-3 py-1 text-2xl text-slate-400 hover:bg-slate-800"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="ticket-title">
                          Ticket title *
                        </label>
                        <input
                          id="ticket-title"
                          name="title"
                          value={form.title}
                          onChange={updateField}
                          placeholder="Enter ticket title"
                          required
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="ticket-project">
                          Project *
                        </label>
                        <select
                          id="ticket-project"
                          name="project_id"
                          value={form.project_id}
                          onChange={updateField}
                          required
                          className={inputClass}
                        >
                          <option value="">Select project</option>
                          {projects.map((project) => (
                            <option
                              key={project.project_id}
                              value={project.project_id}
                            >
                              {project.name || project.project_name || "Unnamed project"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="ticket-description">
                        Description
                      </label>
                      <textarea
                        id="ticket-description"
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        rows={4}
                        placeholder="Enter ticket description"
                        className={`${inputClass} h-auto min-h-28 resize-y`}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="ticket-status">
                          Status *
                        </label>
                        <select
                          id="ticket-status"
                          name="status_id"
                          value={form.status_id}
                          onChange={updateField}
                          required
                          className={inputClass}
                        >
                          <option value="">Select status</option>
                          {statuses.map((status) => (
                            <option key={status.status_id} value={status.status_id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="ticket-priority">
                          Priority *
                        </label>
                        <select
                          id="ticket-priority"
                          name="priority_id"
                          value={form.priority_id}
                          onChange={updateField}
                          required
                          className={inputClass}
                        >
                          <option value="">Select priority</option>
                          {priorities.map((priority) => (
                            <option
                              key={priority.priority_id}
                              value={priority.priority_id}
                            >
                              {priority.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="ticket-assignee">
                          Assign member
                        </label>
                        <select
                          id="ticket-assignee"
                          name="assigned_to"
                          value={form.assigned_to}
                          onChange={updateField}
                          className={inputClass}
                        >
                          <option value="">Unassigned</option>
                          {employees.map((employee) => (
                            <option
                              key={employee.user_id}
                              value={employee.user_id}
                            >
                              {employee.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="ticket-due-date">
                          Due date
                        </label>
                        <input
                          id="ticket-due-date"
                          type="date"
                          name="due_date"
                          value={form.due_date}
                          onChange={updateField}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[#26344e] pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={submitting}
                        className="rounded-lg border border-[#34435f] px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                      >
                        {submitting
                          ? "Saving..."
                          : editingTicket
                            ? "Save changes"
                            : "Create ticket"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
