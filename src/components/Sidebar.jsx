import { Link, NavLink, useNavigate } from "react-router-dom";

const mainItems = [
  { label: "Overview", icon: "▦", path: "/dashboard" },
  { label: "Projects", icon: "▱", path: "/projects" },
  { label: "Tickets", icon: "▤", path: "/tickets" },
  { label: "Invitation", icon: "✉\uFE0E", path: "/invites" },
];

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
    isActive
      ? "bg-[#24345d] text-[#a9bcff]"
      : "text-slate-400 hover:bg-[#17223b] hover:text-white"
  }`;

export default function Sidebar() {
  const navigate = useNavigate();

  // Deletes the saved login and goes back to the login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-[#202943] bg-[#0c1427] px-4 py-5 text-white">
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
          <NavLink key={item.path} to={item.path} className={linkClasses}>
            <span className="w-4 text-center text-base">{item.icon}</span>
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

      {/* Bottom section: user + log out */}
      <div className="mt-auto border-t border-[#202943] pt-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-slate-950">
            YO
          </span>
          <div>
            <p className="text-xs font-semibold">You</p>
            <p className="text-[10px] text-slate-500">Support Lead</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#202943] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
}