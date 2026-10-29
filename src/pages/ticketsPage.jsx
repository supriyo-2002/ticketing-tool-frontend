
import { useEffect, useMemo, useState } from "react";
import { getProjects } from "../api/project.js";
import {
  getTickets,
  createTicket as createTicketAPI,
} from "../api/tickets.js";
import { getStatuses } from "../api/statuses.js";
import { getPriorities } from "../api/priorities.js";

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

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [form, setForm] = useState(initialForm);

  const loadData = async ({ showLoader = true } = {}) => {
    if (showLoader) setLoading(true);

    setPageError("");

    try {
      const [
        ticketResponse,
        projectResponse,
        statusResponse,
        priorityResponse,
      ] = await Promise.all([
        getTickets(),
        getProjects(),
        getStatuses(),
        getPriorities(),
      ]);

      console.log("GET tickets response:", ticketResponse);

      const fetchedTickets = getArray(ticketResponse, ["tickets"]);
      const fetchedProjects = getArray(projectResponse, ["projects"]);
      const fetchedStatuses = getArray(statusResponse, ["statuses"]);
      const fetchedPriorities = getArray(priorityResponse, ["priorities"]);

      setTickets(fetchedTickets);
      setProjects(fetchedProjects);
      setStatuses(fetchedStatuses);
      setPriorities(fetchedPriorities);

      return fetchedTickets;
    } catch (error) {
      console.error("Failed to load ticket page data:", error);
      setPageError(getErrorMessage(error));
      throw error;
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        String(ticket.title || "").toLowerCase().includes(searchText) ||
        String(ticket.description || "").toLowerCase().includes(searchText) ||
        String(ticket.ticket_id || ticket.id || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        !statusFilter ||
        String(ticket.status_id || "") === statusFilter ||
        String(ticket.status?.status_id || "") === statusFilter ||
        String(ticket.status?.name || "") === statusFilter ||
        String(ticket.status || "") === statusFilter;

      const matchesPriority =
        !priorityFilter ||
        String(ticket.priority_id || "") === priorityFilter ||
        String(ticket.priority?.priority_id || "") === priorityFilter ||
        String(ticket.priority?.name || "") === priorityFilter ||
        String(ticket.priority || "") === priorityFilter;

      const matchesProject =
        !projectFilter ||
        String(ticket.project_id || "") === projectFilter ||
        String(ticket.project?.project_id || "") === projectFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesProject
      );
    });
  }, [tickets, search, statusFilter, priorityFilter, projectFilter]);

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
      assigned_to: form.assigned_to.trim() || null,
      due_date: form.due_date || null,
    };

    console.log("POST create-ticket payload:", payload);

    setSubmitting(true);

    try {
      // Send the creation request to the backend.
      const createResponse = await createTicketAPI(payload);

      console.log("POST create-ticket response:", createResponse);

      // Re-fetch tickets from the backend to verify persistence.
      const refreshedTickets = await getTickets();

      console.log("GET tickets response after creation:", refreshedTickets);

      const latestTickets = getArray(refreshedTickets, ["tickets"]);

      setTickets(latestTickets);

      // Check whether the newly created ticket appears in the GET response.
      const createdTicket =
        createResponse?.data?.ticket ||
        createResponse?.ticket ||
        createResponse?.data ||
        createResponse;

      const createdId =
        createdTicket?.ticket_id ||
        createdTicket?.id;

      const appearsInList = createdId
        ? latestTickets.some(
            (ticket) =>
              String(ticket.ticket_id || ticket.id) === String(createdId)
          )
        : latestTickets.some(
            (ticket) =>
              ticket.title === payload.title &&
              ticket.project_id === payload.project_id
          );

      if (appearsInList) {
        setSuccessMessage(
          "Ticket created and confirmed in the backend ticket list."
        );

        setForm(initialForm);
        setModalOpen(false);
      } else {
        setPageError(
          "The create request returned, but the ticket was not found in the refreshed ticket list. Check the POST and GET responses in the browser console."
        );
      }
    } catch (error) {
      console.error("Ticket creation or verification failed:", error);
      setPageError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
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

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500";

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tickets</h1>
            <p className="mt-1 text-sm text-slate-400">
              View and manage tickets from your ticketing system.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPageError("");
              setSuccessMessage("");
              setModalOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create Ticket
          </button>
        </div>

        {pageError && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">
            {pageError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-800 bg-green-950/50 p-3 text-sm text-green-300">
            {successMessage}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Tickets</p>
            <p className="mt-2 text-3xl font-bold">{tickets.length}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Projects</p>
            <p className="mt-2 text-3xl font-bold">{projects.length}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Filtered Tickets</p>
            <p className="mt-2 text-3xl font-bold">
              {filteredTickets.length}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
            className={inputClass}
          />

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
                {project.name || project.project_name || "Unnamed project"}
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
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          {loading ? (
            <p className="p-8 text-center text-slate-400">
              Loading tickets...
            </p>
          ) : (
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Ticket</th>
                  <th className="px-5 py-4 font-medium">Project</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Priority</th>
                  <th className="px-5 py-4 font-medium">Due Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredTickets.map((ticket, index) => (
                  <tr
                    key={ticket.ticket_id || ticket.id || index}
                    className="hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {ticket.title || "Untitled ticket"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.ticket_id || ticket.id || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {getProjectName(ticket)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {getStatusName(ticket)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {getPriorityName(ticket)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {ticket.due_date
                        ? String(ticket.due_date).slice(0, 10)
                        : "—"}
                    </td>
                  </tr>
                ))}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
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
                        {project.name || project.project_name || "Unnamed project"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Ticket Title *
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
                    Assigned To (optional)
                  </label>
                  <input
                    name="assigned_to"
                    value={form.assigned_to}
                    onChange={updateField}
                    placeholder="Enter assignee ID if required by the API"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Due Date (optional)
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
