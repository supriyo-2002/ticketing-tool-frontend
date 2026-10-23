
import { useState } from "react";
import { Link } from "react-router-dom";

const tickets = [
  {
    id: "TCK-1042",
    title: "Checkout page fails on Safari for logged-out users",
    project: "Storefront Web",
    status: "In progress",
    priority: "High",
    assignee: "Dev Kapoor",
    initials: "DK",
    due: "Sep 23",
    color: "bg-amber-400",
  },
  {
    id: "TCK-1039",
    title: "Warehouse scan gun loses connection intermittently",
    project: "Warehouse Portal",
    status: "Open",
    priority: "Critical",
    assignee: "Rosa Silva",
    initials: "RS",
    due: "Sep 22",
    color: "bg-emerald-400",
  },
  {
    id: "TCK-1035",
    title: "Add bulk CSV export for shipment history",
    project: "Warehouse Portal",
    status: "Open",
    priority: "Medium",
    assignee: "Mara Patel",
    initials: "MP",
    due: "Sep 27",
    color: "bg-sky-400",
  },
  {
    id: "TCK-1031",
    title: "Dark mode toggle resets on page refresh",
    project: "Mobile App",
    status: "Resolved",
    priority: "Low",
    assignee: "You",
    initials: "YO",
    due: "Sep 20",
    color: "bg-blue-500",
  },
  {
    id: "TCK-1028",
    title: "Push notification tokens not refreshing after login",
    project: "Mobile App",
    status: "In progress",
    priority: "High",
    assignee: "Dev Kapoor",
    initials: "DK",
    due: "Sep 24",
    color: "bg-amber-400",
  },
];

const stats = [
  {
    label: "Open tickets",
    value: "23",
    note: "↑ 4 since yesterday",
    noteColor: "text-emerald-400",
  },
  {
    label: "In progress",
    value: "14",
    note: "Steady",
    noteColor: "text-slate-500",
  },
  {
    label: "Resolved this week",
    value: "31",
    note: "↑ 12% vs last week",
    noteColor: "text-emerald-400",
  },
  {
    label: "Overdue",
    value: "4",
    note: "Needs attention",
    noteColor: "text-rose-400",
  },
];

const priorities = [
  { name: "Critical", count: 2, color: "bg-rose-500", width: "67%" },
  { name: "High", count: 2, color: "bg-amber-400", width: "67%" },
  { name: "Medium", count: 3, color: "bg-blue-500", width: "100%" },
  { name: "Low", count: 1, color: "bg-slate-500", width: "33%" },
];

const team = [
  { name: "Dev Kapoor", initials: "DK", count: 6, color: "bg-amber-400" },
  { name: "Rosa Silva", initials: "RS", count: 5, color: "bg-emerald-400" },
  { name: "Mara Patel", initials: "MP", count: 4, color: "bg-blue-400" },
  { name: "You", initials: "YO", count: 3, color: "bg-blue-500" },
];

const navItems = [
  { label: "Overview", icon: "▦", href: "/dashboard" },
  { label: "Projects", icon: "▱", href: "/projects" },
  { label: "Tickets", icon: "▤", href: "/tickets" },
  { label: "Team", icon: "♙", href: "/team" },
];

function Avatar({ initials, color = "bg-blue-500" }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color} text-[10px] font-bold text-slate-950`}
    >
      {initials}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Open: "bg-blue-500/15 text-blue-300",
    "In progress": "bg-amber-500/15 text-amber-300",
    Resolved: "bg-emerald-500/15 text-emerald-300",
  };

  const dots = {
    Open: "bg-blue-400",
    "In progress": "bg-amber-400",
    Resolved: "bg-emerald-400",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${
        styles[status] || "bg-slate-700 text-slate-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    Critical: "bg-rose-500/15 text-rose-300",
    High: "bg-amber-500/15 text-amber-300",
    Medium: "bg-blue-500/15 text-blue-300",
    Low: "bg-slate-500/15 text-slate-400",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${
        styles[priority] || "bg-slate-700 text-slate-300"
      }`}
    >
      {priority}
    </span>
  );
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredTickets = tickets.filter((ticket) =>
    `${ticket.id} ${ticket.title} ${ticket.project} ${ticket.assignee}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const visibleTickets = showAll
    ? filteredTickets
    : filteredTickets.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#080d18] text-[#f3f5fb]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-[#202943] bg-[#0c1427] px-4 py-5 md:flex">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6482ff] to-[#4558df] text-lg font-bold text-white">
              ✓
            </span>
            <span className="text-lg font-bold tracking-tight">Relay</span>
          </Link>

          <p className="mb-2 px-2 text-[10px] font-bold tracking-widest text-slate-500">
            Ticketing - Tool
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setActiveNav(item.label)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  activeNav === item.label
                    ? "bg-[#24345d] text-[#a9bcff]"
                    : "text-slate-400 hover:bg-[#17223b] hover:text-white"
                }`}
              >
                <span className="w-4 text-center text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="mb-2 mt-8 px-2 text-[10px] font-bold tracking-widest text-slate-500">
            SETTINGS
          </p>

          <Link
            to="/preferences"
            onClick={() => setActiveNav("Preferences")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              activeNav === "Preferences"
                ? "bg-[#24345d] text-[#a9bcff]"
                : "text-slate-400 hover:bg-[#17223b] hover:text-white"
            }`}
          >
            <span className="w-4 text-center">⚙</span>
            Preferences
          </Link>

          <div className="mt-auto border-t border-[#202943] pt-4">
            <div className="flex items-center gap-3 px-1">
              <Avatar initials="YO" />
              <div className="min-w-0">
                <p className="text-xs font-semibold">You</p>
                <p className="text-[10px] text-slate-500">Support Lead</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {/* Top navigation */}
          <header className="mb-6 flex items-center justify-between gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 md:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#536df5] font-bold">
                ✓
              </span>
              <span className="font-bold">Relay</span>
            </Link>

            <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-[#202943] bg-[#111b32] px-3 py-2.5 focus-within:border-[#536df5]">
              <span className="text-slate-500">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets, projects, people..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                aria-label="Search tickets"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-slate-400 hover:text-white"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </label>

            <div className="relative flex shrink-0 items-center gap-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#202943] bg-[#111b32] text-slate-300 hover:bg-[#1a2743]"
              >
                ♧
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400" />
              </button>

              {showNotifications && (
                <div className="absolute right-12 top-11 z-20 w-64 rounded-xl border border-[#283552] bg-[#111b32] p-4 shadow-xl">
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    You have 4 overdue tickets that may need attention.
                  </p>
                </div>
              )}

              <Avatar initials="YO" />
            </div>
          </header>

          {/* Page title */}
          <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Overview
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Northwind Logistics · Tuesday, September 22
              </p>
            </div>

            <Link
              to="/tickets"
              className="rounded-lg bg-gradient-to-r from-[#5b78ff] to-[#4560e9] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:brightness-110"
            >
              + New ticket
            </Link>
          </section>

          {/* Summary cards */}
          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#1d2944] bg-[#111d36] p-4 transition hover:border-[#344568]"
              >
                <p className="text-xs font-medium text-slate-400">
                  {stat.label}
                </p>
                <p className="my-2 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className={`text-[10px] font-medium ${stat.noteColor}`}>
                  {stat.note}
                </p>
              </div>
            ))}
          </section>

          {/* Tickets and side panels */}
          <section className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(0,1.7fr)_minmax(270px,0.9fr)]">
            {/* Recent tickets */}
            <div className="min-w-0 overflow-hidden rounded-xl border border-[#1d2944] bg-[#111d36]">
              <div className="flex items-center justify-between border-b border-[#202943] px-4 py-4">
                <h2 className="text-sm font-semibold">Recent tickets</h2>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300"
                >
                  {showAll ? "Show less" : "View all"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-left">
                  <thead>
                    <tr className="text-[9px] font-bold tracking-wider text-slate-500">
                      <th className="px-3 py-3">ID</th>
                      <th className="px-3 py-3">TICKET</th>
                      <th className="px-3 py-3">STATUS</th>
                      <th className="px-3 py-3">PRIORITY</th>
                      <th className="px-3 py-3">ASSIGNEE</th>
                      <th className="px-3 py-3">DUE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-t border-[#202943]/80 transition hover:bg-[#172541]"
                      >
                        <td className="px-3 py-4 text-[10px] text-slate-500">
                          {ticket.id}
                        </td>
                        <td className="max-w-[220px] px-3 py-4">
                          <p className="text-[11px] font-medium leading-snug text-slate-200">
                            {ticket.title}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {ticket.project}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-3 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar initials={ticket.initials} color={ticket.color} />
                            <span className="whitespace-nowrap text-[10px] text-slate-300">
                              {ticket.assignee}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-[10px] text-slate-400">
                          {ticket.due}
                        </td>
                      </tr>
                    ))}

                    {visibleTickets.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-sm text-slate-400"
                        >
                          No tickets match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right-side panels */}
            <div className="space-y-4">
              {/* Priority */}
              <div className="rounded-xl border border-[#1d2944] bg-[#111d36] p-4">
                <h2 className="mb-5 text-sm font-semibold">By priority</h2>

                <div className="space-y-5">
                  {priorities.map((priority) => (
                    <div
                      key={priority.name}
                      className="flex items-center gap-3"
                    >
                      <span className="w-12 shrink-0 text-[10px] text-slate-400">
                        {priority.name}
                      </span>

                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#081225]">
                        <div
                          className={`h-full rounded-full ${priority.color}`}
                          style={{ width: priority.width }}
                        />
                      </div>

                      <span className="w-3 text-right text-[10px] text-slate-500">
                        {priority.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team load */}
              <div className="overflow-hidden rounded-xl border border-[#1d2944] bg-[#111d36]">
                <div className="border-b border-[#202943] px-4 py-4">
                  <h2 className="text-sm font-semibold">Team load</h2>
                </div>

                <div className="space-y-4 p-4">
                  {team.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar
                          initials={member.initials}
                          color={member.color}
                        />
                        <span className="truncate text-[11px] text-slate-300">
                          {member.name}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {member.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <footer className="py-6 text-center text-[10px] text-slate-600">
            Relay · Ticket Tracking Workspace
          </footer>
        </main>
      </div>
    </div>
  );
}
