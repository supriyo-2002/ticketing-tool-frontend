
import { useEffect, useMemo, useState } from "react";

import { getProjects } from "../api/project.js";
import {
  getTickets,
  createTicket as createTicketAPI,
  deleteTicket,
} from "../api/tickets.js";
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

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [statusTab, setStatusTab] = useState("All");
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    setPageError("");

    try {
      const [
        ticketResponse,
        projectResponse,
        statusResponse,
        priorityResponse,
        employeeResponse,
      ] = await Promise.all([
        getTickets(),
        getProjects(),
        getStatuses(),
        getPriorities(),
        getEmployees(),
      ]);

      setTickets(getArray(ticketResponse, ["tickets"]));
      setProjects(getArray(projectResponse, ["projects"]));
      setStatuses(getArray(statusResponse, ["statuses"]));
      setPriorities(getArray(priorityResponse, ["priorities"]));
      setEmployees(getArray(employeeResponse, ["employees"]));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        (item) =>
          String(item.status_id) === String(ticket.status_id)
      )?.name ||
      "Unknown"
    );
  };

  const getPriorityName = (ticket) => {
    if (typeof ticket.priority === "string") return ticket.priority;

    return (
      ticket.priority?.name ||
      priorities.find(
        (item) =>
          String(item.priority_id) === String(ticket.priority_id)
      )?.name ||
      "Unknown"
    );
  };

  const getProjectName = (ticket) => {
    const project = projects.find(
      (item) =>
        String(item.project_id) === String(ticket.project_id)
    );

    return (
      ticket.project?.name ||
      ticket.project?.project_name ||
      project?.name ||
      project?.project_name ||
      "Unknown"
    );
  };

  const getOrganizationName = (ticket) => {
    return (
      ticket.organization?.name ||
      ticket.organization?.organization_name ||
      ticket.organization_name ||
      "Organization name unavailable"
    );
  };

  const getTicketId = (ticket) => {
    return ticket.ticket_id ?? ticket.id;
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch = [
        ticket.title,
        ticket.description,
        getProjectName(ticket),
        getEmployeeName(ticket.assigned_to),
        getEmployeeName(ticket.created_by),
        getStatusName(ticket),
        getPriorityName(ticket),
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      const matchesStatusFilter =
        !statusFilter ||
        String(ticket.status_id) === String(statusFilter) ||
        String(ticket.status?.status_id) === String(statusFilter) ||
        getStatusName(ticket) ===
          statuses.find(
            (item) =>
              String(item.status_id) === String(statusFilter)
          )?.name;

      const matchesPriorityFilter =
        !priorityFilter ||
        String(ticket.priority_id) === String(priorityFilter) ||
        String(ticket.priority?.priority_id) === String(priorityFilter) ||
        getPriorityName(ticket) ===
          priorities.find(
            (item) =>
              String(item.priority_id) === String(priorityFilter)
          )?.name;

      const matchesProjectFilter =
        !projectFilter ||
        String(ticket.project_id) === String(projectFilter) ||
        String(ticket.project?.project_id) === String(projectFilter);

      const normalizedStatus = getStatusName(ticket)
        .trim()
        .toLowerCase();

      const matchesTab =
        statusTab === "All" ||
        (statusTab === "Open" && normalizedStatus === "open") ||
        (statusTab === "In Progress" &&
          ["in progress", "in-progress", "in_progress"].includes(
            normalizedStatus
          )) ||
        (statusTab === "Resolved" &&
          normalizedStatus === "resolved") ||
        (statusTab === "Closed" &&
          normalizedStatus === "closed");

      return (
        matchesSearch &&
        matchesStatusFilter &&
        matchesPriorityFilter &&
        matchesProjectFilter &&
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

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateTicket = async (event) => {
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
      description: form.description.trim() || "",
      status_id: form.status_id,
      priority_id: form.priority_id,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date || null,
    };

    setSubmitting(true);

    try {
      await createTicketAPI(payload);

      setSuccessMessage("Ticket created successfully.");
      setForm(initialForm);
      setModalOpen(false);

      await loadData();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async (ticket) => {
    const ticketId = getTicketId(ticket);

    if (ticketId == null || ticketId === "") {
      setPageError("Cannot delete this ticket: ticket ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${ticket.title || "this ticket"}"?`
    );

    if (!confirmed) return;

    setPageError("");
    setSuccessMessage("");
    setDeletingId(ticketId);

    try {
      await deleteTicket(ticketId);

      setTickets((previous) =>
        previous.filter(
          (item) =>
            String(getTicketId(item)) !== String(ticketId)
        )
      );

      setSelectedTicket((previous) =>
        previous &&
        String(getTicketId(previous)) === String(ticketId)
          ? null
          : previous
      );

      setSuccessMessage("Ticket deleted successfully.");
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full min-w-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  const tabClass = (tab) =>
    `shrink-0 rounded-lg border px-3 py-2.5 text-sm transition sm:px-4 ${
      statusTab === tab
        ? "border-blue-700 bg-blue-950 text-blue-300"
        : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
    }`;

  const selectedTicketId = selectedTicket
    ? getTicketId(selectedTicket)
    : null;

  return (
    <div className="relative isolate min-h-screen min-w-0 text-slate-100">
      {/* Fixed background stays stationary while page content scrolls */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-slate-950"
      />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[1600px] min-w-0 p-2 sm:p-4 lg:p-6">
                {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Tickets
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {tickets.length} tickets across {projects.length} projects
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPageError("");
              setSuccessMessage("");
              setForm(initialForm);
              setModalOpen(true);
            }}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
          >
            + New ticket
          </button>
        </div>

        {/* Messages */}
        {pageError && (
          <div
            role="alert"
            className="mb-4 break-words rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300"
          >
            {pageError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-300"
          >
            {successMessage}
          </div>
        )}

        {/* Status tabs */}
        <div className="mb-4 min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
            {["All", "Open", "In Progress", "Resolved", "Closed"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  aria-pressed={statusTab === tab}
                  className={tabClass(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All priorities</option>
            {priorities.map((priority) => (
              <option
                key={priority.priority_id}
                value={priority.priority_id}
              >
                {priority.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by project"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option
                key={project.project_id}
                value={project.project_id}
              >
                {project.name ||
                  project.project_name ||
                  "Unnamed project"}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option
                key={status.status_id}
                value={status.status_id}
              >
                {status.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="mb-5 min-w-0">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets, projects, assignees..."
            aria-label="Search tickets"
            className={inputClass}
          />
        </div>

        {/* Ticket list */}
        <div className="min-w-0">
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              {tickets.length === 0
                ? "No tickets returned by the API."
                : "No tickets match your search or filters."}
            </div>
          ) : (
            <>
              {/* Mobile ticket cards */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredTickets.map((ticket) => {
                  const ticketId = getTicketId(ticket);

                  return (
                    <article
                      key={ticketId}
                      onClick={() => setSelectedTicket(ticket)}
                      className="min-w-0 cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-600"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-xs text-slate-500">
                            {ticket.ticket_number ||
                              ticket.ticket_code ||
                              (ticketId != null
                                ? `TCK-${String(ticketId).slice(0, 8)}`
                                : "—")}
                          </p>

                          <h3 className="break-words font-semibold text-white">
                            {ticket.title || "Untitled ticket"}
                          </h3>

                          <p className="mt-1 break-words text-xs text-slate-400">
                            {getProjectName(ticket)}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={deletingId === ticketId}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteTicket(ticket);
                          }}
                          className="shrink-0 rounded-lg border border-red-800 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === ticketId
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
                        <div className="min-w-0">
                          <p className="mb-1 text-xs text-slate-500">
                            Status
                          </p>
                          <p className="break-words text-sm text-blue-300">
                            {getStatusName(ticket)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-xs text-slate-500">
                            Priority
                          </p>
                          <p className="break-words text-sm text-rose-300">
                            {getPriorityName(ticket)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-xs text-slate-500">
                            Assignee
                          </p>
                          <p className="break-words text-sm text-slate-300">
                            {getEmployeeName(ticket.assigned_to)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-xs text-slate-500">
                            Due date
                          </p>
                          <p className="text-sm text-slate-300">
                            {formatDate(ticket.due_date)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-blue-400">
                        Tap to view ticket details →
                      </p>
                    </article>
                  );
                })}
              </div>

              {/* Desktop ticket table */}
              <div className="hidden overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 md:block">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-medium">ID</th>
                      <th className="px-5 py-4 font-medium">Ticket</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Priority</th>
                      <th className="px-5 py-4 font-medium">Assignee</th>
                      <th className="px-5 py-4 font-medium">Due date</th>
                      <th className="px-5 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredTickets.map((ticket) => {
                      const ticketId = getTicketId(ticket);

                      return (
                        <tr
                          key={ticketId}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`cursor-pointer transition ${
                            selectedTicketId != null &&
                            String(selectedTicketId) === String(ticketId)
                              ? "bg-slate-800"
                              : "hover:bg-slate-800/50"
                          }`}
                        >
                          <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                            {ticket.ticket_number ||
                              ticket.ticket_code ||
                              (ticketId != null
                                ? `TCK-${String(ticketId).slice(0, 8)}`
                                : "—")}
                          </td>

                          <td className="min-w-[200px] px-5 py-4">
                            <p className="font-semibold text-white">
                              {ticket.title || "Untitled ticket"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {getProjectName(ticket)}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                              {getStatusName(ticket)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="inline-flex rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300">
                              {getPriorityName(ticket)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                            {getEmployeeName(ticket.assigned_to)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                            {formatDate(ticket.due_date)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <button
                              type="button"
                              disabled={deletingId === ticketId}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteTicket(ticket);
                              }}
                              className="rounded-lg border border-red-800 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === ticketId
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Responsive ticket details panel */}
        {selectedTicket && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSelectedTicket(null)}
          >
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Ticket details"
              onClick={(event) => event.stopPropagation()}
              className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-900 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:inset-x-6 sm:bottom-6 sm:rounded-2xl md:inset-x-auto md:bottom-auto md:right-5 md:top-24 md:w-[440px] md:max-h-[calc(100dvh-8rem)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Ticket details
                  </p>
                  <h2 className="mt-2 break-words text-xl font-bold text-white">
                    {selectedTicket.title || "Untitled ticket"}
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Close ticket details"
                  onClick={() => setSelectedTicket(null)}
                  className="shrink-0 rounded-lg px-2 text-2xl text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 border-b border-slate-700 pb-4">
                <p className="mb-1 text-xs text-slate-500">
                  Description
                </p>
                <p className="whitespace-pre-wrap break-words text-sm text-slate-200">
                  {selectedTicket.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <div className="col-span-2 min-w-0">
                  <p className="mb-1 text-xs text-slate-500">
                    Organization
                  </p>
                  <p className="break-words font-semibold text-slate-200">
                    {getOrganizationName(selectedTicket)}
                  </p>
                </div>

                <div className="col-span-2 min-w-0">
                  <p className="mb-1 text-xs text-slate-500">Project</p>
                  <p className="break-words font-semibold text-slate-200">
                    {getProjectName(selectedTicket)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-500">Status</p>
                  <p className="break-words font-semibold text-blue-300">
                    {getStatusName(selectedTicket)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-500">Priority</p>
                  <p className="break-words font-semibold text-purple-300">
                    {getPriorityName(selectedTicket)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-500">
                    Assigned to
                  </p>
                  <p className="break-words font-semibold text-slate-200">
                    {getEmployeeName(selectedTicket.assigned_to)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-500">
                    Created by
                  </p>
                  <p className="break-words font-semibold text-slate-200">
                    {getEmployeeName(selectedTicket.created_by)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-500">Due date</p>
                  <p className="text-slate-200">
                    {formatDate(selectedTicket.due_date)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-500">Created at</p>
                  <p className="break-words text-xs text-slate-300">
                    {formatDateTime(selectedTicket.created_at)}
                  </p>
                </div>

                <div className="col-span-2 min-w-0">
                  <p className="mb-1 text-xs text-slate-500">
                    Last updated
                  </p>
                  <p className="break-words text-xs text-slate-300">
                    {formatDateTime(selectedTicket.updated_at)}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Create ticket modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 pt-4 sm:items-center sm:p-4">
            <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-2xl sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Create Ticket</h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="shrink-0 rounded-lg px-2 text-2xl text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label
                    htmlFor="ticket-project"
                    className="mb-1.5 block text-sm text-slate-300"
                  >
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
                        {project.name ||
                          project.project_name ||
                          "Unnamed project"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ticket-title"
                    className="mb-1.5 block text-sm text-slate-300"
                  >
                    Ticket title *
                  </label>
                  <input
                    id="ticket-title"
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    required
                    placeholder="Enter ticket title"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label
                      htmlFor="ticket-status"
                      className="mb-1.5 block text-sm text-slate-300"
                    >
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
                        <option
                          key={status.status_id}
                          value={status.status_id}
                        >
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label
                      htmlFor="ticket-priority"
                      className="mb-1.5 block text-sm text-slate-300"
                    >
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

                <div>
                  <label
                    htmlFor="ticket-description"
                    className="mb-1.5 block text-sm text-slate-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="ticket-description"
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={3}
                    placeholder="Describe the issue or task"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="ticket-assignee"
                    className="mb-1.5 block text-sm text-slate-300"
                  >
                    Assigned to
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
                  <label
                    htmlFor="ticket-due-date"
                    className="mb-1.5 block text-sm text-slate-300"
                  >
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

                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? "Creating..." : "Create Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
     

