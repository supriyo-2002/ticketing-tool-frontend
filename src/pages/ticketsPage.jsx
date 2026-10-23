
import { useMemo, useState } from "react";

const initialTickets = [
  {
    id: "TCK-1042",
    title: "Checkout page fails on Safari for logged-out users",
    project: "Storefront Web",
    status: "In progress",
    priority: "High",
    assignee: "Dev Kapoor",
    initials: "DK",
    avatar: "bg-amber-500",
    due: "Sep 23",
  },
  {
    id: "TCK-1039",
    title: "Warehouse scan gun loses connection intermittently",
    project: "Warehouse Portal",
    status: "Open",
    priority: "Critical",
    assignee: "Rosa Silva",
    initials: "RS",
    avatar: "bg-emerald-500",
    due: "Sep 22",
  },
  {
    id: "TCK-1035",
    title: "Add bulk CSV export for shipment history",
    project: "Warehouse Portal",
    status: "Open",
    priority: "Medium",
    assignee: "Mara Patel",
    initials: "MP",
    avatar: "bg-blue-400",
    due: "Sep 27",
  },
  {
    id: "TCK-1031",
    title: "Dark mode toggle resets on page refresh",
    project: "Mobile App",
    status: "Resolved",
    priority: "Low",
    assignee: "You",
    initials: "YO",
    avatar: "bg-blue-600",
    due: "Sep 20",
  },
  {
    id: "TCK-1028",
    title: "Push notification tokens not refreshing after login",
    project: "Mobile App",
    status: "In progress",
    priority: "High",
    assignee: "Dev Kapoor",
    initials: "DK",
    avatar: "bg-amber-500",
    due: "Sep 24",
  },
  {
    id: "TCK-1024",
    title: "Onboarding tour skips step 3 on slow connections",
    project: "Storefront Web",
    status: "Closed",
    priority: "Medium",
    assignee: "Rosa Silva",
    initials: "RS",
    avatar: "bg-emerald-500",
    due: "Sep 15",
  },
  {
    id: "TCK-1019",
    title: "Invoice PDF totals off by rounding on multi-currency orders",
    project: "Billing",
    status: "Open",
    priority: "Critical",
    assignee: "Mara Patel",
    initials: "MP",
    avatar: "bg-blue-400",
    due: "Sep 22",
  },
  {
    id: "TCK-1012",
    title: "Add SSO support for Northwind sub-org accounts",
    project: "Platform",
    status: "In progress",
    priority: "Medium",
    assignee: "You",
    initials: "YO",
    avatar: "bg-blue-600",
    due: "Sep 30",
  },
];

const statuses = ["All", "Open", "In progress", "Resolved", "Closed"];

const statusStyles = {
  Open: "bg-blue-500/15 text-blue-300",
  "In progress": "bg-amber-500/15 text-amber-400",
  Resolved: "bg-emerald-500/15 text-emerald-400",
  Closed: "bg-slate-500/15 text-slate-400",
};

const priorityStyles = {
  Critical: "bg-red-500/10 text-red-400",
  High: "bg-amber-500/10 text-amber-400",
  Medium: "bg-blue-500/10 text-blue-300",
  Low: "bg-slate-500/10 text-slate-400",
};

export default function Tickets() {
  const [tickets, setTickets] = useState(initialTickets);
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProject, setNewProject] = useState("Storefront Web");
  const [newPriority, setNewPriority] = useState("Medium");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        activeStatus === "All" || ticket.status === activeStatus;

      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        [ticket.id, ticket.title, ticket.project, ticket.assignee]
          .some((value) => value.toLowerCase().includes(term));

      return (
        matchesStatus &&
        matchesSearch &&
        (priorityFilter === "All" || ticket.priority === priorityFilter) &&
        (projectFilter === "All" || ticket.project === projectFilter) &&
        (assigneeFilter === "All" || ticket.assignee === assigneeFilter)
      );
    });
  }, [
    tickets,
    activeStatus,
    search,
    priorityFilter,
    projectFilter,
    assigneeFilter,
  ]);

  function createTicket(event) {
    event.preventDefault();

    const title = newTitle.trim();
    if (!title) return;

    const ticket = {
      id: `TCK-${Math.max(...tickets.map((item) => Number(item.id.slice(4)))) + 1}`,
      title,
      project: newProject,
      status: "Open",
      priority: newPriority,
      assignee: "You",
      initials: "YO",
      avatar: "bg-blue-600",
      due: "Not set",
    };

    setTickets((current) => [ticket, ...current]);
    setActiveStatus("All");
    setSearch("");
    setPriorityFilter("All");
    setProjectFilter("All");
    setAssigneeFilter("All");
    setShowModal(false);
    setNewTitle("");
  }

  const filterClass =
    "rounded-lg border border-[#202c46] bg-[#111c34] px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500";

  return (
    <div className="min-h-full bg-[#080d18] text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tickets.length === 8
              ? "86 tickets across 5 projects"
              : `${tickets.length} sample tickets · 5 projects`}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#4d7cff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span className="text-lg leading-none">+</span> New ticket
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-[#202c46] bg-[#101a30] px-3 py-2.5 sm:max-w-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-4 w-4 shrink-0 text-slate-500"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tickets, projects, people..."
          aria-label="Search tickets, projects, and people"
          className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 hover:text-white"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status tabs and filters */}
      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Filter by status">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              aria-pressed={activeStatus === status}
              className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                activeStatus === status
                  ? "border-[#263d70] bg-[#20335b] text-blue-300"
                  : "border-[#1b2740] bg-[#101a30] text-slate-400 hover:bg-[#1a2742] hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className={filterClass}
          >
            <option value="All">Priority: All</option>
            {["Critical", "High", "Medium", "Low"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <select
            aria-label="Filter by project"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className={filterClass}
          >
            <option value="All">Project: All</option>
            {["Storefront Web", "Warehouse Portal", "Mobile App", "Billing", "Platform"].map(
              (value) => (
                <option key={value}>{value}</option>
              )
            )}
          </select>

          <select
            aria-label="Filter by assignee"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className={filterClass}
          >
            <option value="All">Assignee: All</option>
            {["Dev Kapoor", "Rosa Silva", "Mara Patel", "You"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-[#202c46] bg-[#101b33]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-[#101a30] text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">ID</th>
                <th className="px-5 py-4 font-semibold">Ticket</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Priority</th>
                <th className="px-5 py-4 font-semibold">Assignee</th>
                <th className="px-5 py-4 font-semibold">Due</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#202c46]">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="transition hover:bg-[#172440]"
                >
                  <td className="whitespace-nowrap px-5 py-5 font-mono text-xs text-slate-500">
                    {ticket.id}
                  </td>

                  <td className="max-w-sm px-5 py-4">
                    <p className="text-[13px] font-medium leading-5 text-slate-100">
                      {ticket.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {ticket.project}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[ticket.status]}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {ticket.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${priorityStyles[ticket.priority]}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ${ticket.avatar}`}
                      >
                        {ticket.initials}
                      </span>
                      <span className="text-xs text-slate-400">
                        {ticket.assignee}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {ticket.due}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTickets.length === 0 && (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium text-slate-300">
                No tickets found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try another search term or change your filters.
              </p>
              <button
                onClick={() => {
                  setActiveStatus("All");
                  setSearch("");
                  setPriorityFilter("All");
                  setProjectFilter("All");
                  setAssigneeFilter("All");
                }}
                className="mt-4 text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-[#202c46] px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredTickets.length} of {tickets.length} sample tickets
          </span>
          <span>Ticket Tracking Tool</span>
        </div>
      </div>

      {/* New ticket modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <form
            onSubmit={createTicket}
            className="w-full max-w-lg rounded-2xl border border-[#263451] bg-[#0e1729] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Create a ticket
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add a new issue to your workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close dialog"
                className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ×
              </button>
            </div>

            <label className="mt-6 block text-sm font-medium text-slate-300">
              Ticket title
              <input
                autoFocus
                required
                maxLength={180}
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Describe the issue..."
                className="mt-2 w-full rounded-lg border border-[#263451] bg-[#101b30] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </label>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-300">
                Project
                <select
                  value={newProject}
                  onChange={(event) => setNewProject(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#263451] bg-[#101b30] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  {["Storefront Web", "Warehouse Portal", "Mobile App", "Billing", "Platform"].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    )
                  )}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Priority
                <select
                  value={newPriority}
                  onChange={(event) => setNewPriority(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#263451] bg-[#101b30] px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  {["Critical", "High", "Medium", "Low"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-[#263451] px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#4d7cff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Create ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
