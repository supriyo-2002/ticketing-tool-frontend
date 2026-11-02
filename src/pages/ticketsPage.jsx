
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

  // Convert user IDs to employee names.
  const getEmployeeName = (userId) => {
    if (!userId) return "Unassigned";

    const employee = employees.find(
      (item) => item.user_id === userId
    );

    return employee?.name || "Employee not found";
  };

  const getStatusName = (ticket) => {
    if (typeof ticket.status === "string") return ticket.status;

    return (
      ticket.status?.name ||
      statuses.find(
        (item) => item.status_id === ticket.status_id
      )?.name ||
      "Unknown"
    );
  };

  const getPriorityName = (ticket) => {
    if (typeof ticket.priority === "string") return ticket.priority;

    return (
      ticket.priority?.name ||
      priorities.find(
        (item) => item.priority_id === ticket.priority_id
      )?.name ||
      "Unknown"
    );
  };

  const getProjectName = (ticket) => {
    return (
      ticket.project?.name ||
      ticket.project?.project_name ||
      projects.find(
        (item) => item.project_id === ticket.project_id
      )?.name ||
      projects.find(
        (item) => item.project_id === ticket.project_id
      )?.project_name ||
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
    return ticket.ticket_id || ticket.id;
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase();

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
        ticket.status_id === statusFilter ||
        ticket.status?.status_id === statusFilter ||
        getStatusName(ticket) === statusFilter;

      const matchesPriorityFilter =
        !priorityFilter ||
        ticket.priority_id === priorityFilter ||
        ticket.priority?.priority_id === priorityFilter ||
        getPriorityName(ticket) === priorityFilter;

      const matchesProjectFilter =
        !projectFilter ||
        ticket.project_id === projectFilter ||
        ticket.project?.project_id === projectFilter;

      const normalizedStatus = getStatusName(ticket).toLowerCase();

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
    // Prevent a button click from triggering the ticket-row click.
    const ticketId = getTicketId(ticket);

    if (!ticketId) {
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
          (item) => getTicketId(item) !== ticketId
        )
      );

      setSelectedTicket((previous) =>
        previous && getTicketId(previous) === ticketId
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
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500";

  const tabClass = (tab) =>
    `rounded-lg border px-4 py-2.5 text-sm transition ${
      statusTab === tab
        ? "border-blue-700 bg-blue-950 text-blue-300"
        : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
    }`;

  const selectedTicketId = selectedTicket
    ? getTicketId(selectedTicket)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tickets</h1>
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
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + New ticket
          </button>
        </div>

        {/* Messages */}
        {pageError && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300">
            {pageError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* Status tabs and filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["All", "Open", "In Progress", "Resolved", "Closed"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  className={tabClass(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            <select
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
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets, projects, assignees..."
            className={`${inputClass} max-w-xl`}
          />
        </div>

        {/* Ticket table and details card */}
        <div className="relative">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            {loading ? (
              <p className="p-8 text-center text-slate-400">
                Loading tickets...
              </p>
            ) : (
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
                    const isSelected = selectedTicketId === ticketId;

                    return (
                      <tr
                        key={ticketId}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? "bg-slate-800/80"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                          {ticket.ticket_number ||
                            ticket.ticket_code ||
                            (ticketId
                              ? `TCK-${String(ticketId).slice(0, 8)}`
                              : "—")}
                        </td>

                        <td className="min-w-[250px] px-5 py-4">
                          <p className="font-semibold text-white">
                            {ticket.title || "Untitled ticket"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {getProjectName(ticket)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                            {getStatusName(ticket)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="inline-flex rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300">
                            {getPriorityName(ticket)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                          {getEmployeeName(ticket.assigned_to)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                          {ticket.due_date
                            ? formatDate(ticket.due_date)
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <button
                            type="button"
                            disabled={deletingId === ticketId}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteTicket(ticket);
                            }}
                            className="rounded-lg border border-red-800 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === ticketId
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        {tickets.length === 0
                          ? "No tickets returned by the API."
                          : "No tickets match your search or filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Ticket details panel: no internal scrolling */}
          {selectedTicket && (
            <aside className="fixed right-5 top-24 z-40 w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Ticket details
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">
                    {selectedTicket.title || "Untitled ticket"}
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Close ticket details"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedTicket(null);
                  }}
                  className="rounded p-1 text-xl leading-none text-slate-400 hover:bg-slate-800 hover:text-white"
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
                <div className="col-span-2">
                  <p className="mb-1 text-xs text-slate-500">
                    Organization
                  </p>
                  <p className="break-words font-semibold text-slate-200">
                    {getOrganizationName(selectedTicket)}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="mb-1 text-xs text-slate-500">Project</p>
                  <p className="break-words font-semibold text-slate-200">
                    {getProjectName(selectedTicket)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-slate-500">Status</p>
                  <p className="font-semibold text-blue-300">
                    {getStatusName(selectedTicket)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-slate-500">Priority</p>
                  <p className="font-semibold text-purple-300">
                    {getPriorityName(selectedTicket)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-slate-500">
                    Assigned to
                  </p>
                  <p className="break-words font-semibold text-slate-200">
                    {getEmployeeName(selectedTicket.assigned_to)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-slate-500">
                    Created by
                  </p>
                  <p className="break-words font-semibold text-slate-200">
                    {getEmployeeName(selectedTicket.created_by)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-slate-500">Due date</p>
                  <p className="text-slate-200">
                    {formatDate(selectedTicket.due_date)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-slate-500">Created at</p>
                  <p className="text-xs text-slate-300">
                    {formatDateTime(selectedTicket.created_at)}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="mb-1 text-xs text-slate-500">
                    Last updated
                  </p>
                  <p className="text-xs text-slate-300">
                    {formatDateTime(selectedTicket.updated_at)}
                  </p>
                </div>
              </div>

              
            </aside>
          )}
        </div>

        {/* Create ticket modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
            <div className="my-6 w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Create Ticket</h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-2xl text-slate-400 hover:text-white"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Project *
                  </label>
                  <select
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
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Ticket title *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    required
                    placeholder="Enter ticket title"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-slate-300">
                      Status *
                    </label>
                    <select
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

                  <div>
                    <label className="mb-1.5 block text-sm text-slate-300">
                      Priority *
                    </label>
                    <select
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
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={3}
                    placeholder="Describe the issue or task"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Assigned to
                  </label>
                  <select
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
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Due date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={updateField}
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
