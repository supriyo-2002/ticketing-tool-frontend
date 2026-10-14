
import { Link, NavLink } from "react-router-dom";

const mainItems = [
  { label: "Overview", icon: "▦", path: "/dashboard" },
  { label: "Projects", icon: "▱", path: "/projects" },
  { label: "Tickets", icon: "▤", path: "/tickets" },
  { label: "Teams", icon: "♙", path: "/teams" },
];

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
    isActive
      ? "bg-[#24345d] text-[#a9bcff]"
      : "text-slate-400 hover:bg-[#17223b] hover:text-white"
  }`;

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-56 shrink-0 flex-col border-r border-[#202943] bg-[#0c1427] px-4 py-5 text-white">
      <Link
        to="/dashboard"
        className="mb-8 flex items-center gap-2.5 px-1"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6482ff] to-[#4558df] text-lg font-bold">
          ✓
        </span>
        <span className="text-lg font-bold tracking-tight">Relay</span>
      </Link>

      <p className="mb-2 px-2 text-[10px] font-bold tracking-widest text-slate-500">
        NORTHWIND LOGISTICS
      </p>

      <nav className="space-y-1">
        {mainItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClasses}
          >
            <span className="w-4 text-center text-base">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <p className="mb-2 mt-8 px-2 text-[10px] font-bold tracking-widest text-slate-500">
        SETTINGS
      </p>

      <NavLink to="/preferences" className={linkClasses}>
        <span className="w-4 text-center">⚙</span>
        Preferences
      </NavLink>

      <div className="mt-auto border-t border-[#202943] pt-4">
        <div className="flex items-center gap-3 px-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-slate-950">
            YO
          </span>
          <div>
            <p className="text-xs font-semibold">You</p>
            <p className="text-[10px] text-slate-500">
              Support Lead
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
