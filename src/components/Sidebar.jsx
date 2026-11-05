import { Link, NavLink, useNavigate } from "react-router-dom";
import { tokenStorage } from "../utils/tokenStorage";

const mainItems = [
  { label: "Overview", icon: "▦", path: "/dashboard" },
  { label: "Projects", icon: "▱", path: "/projects" },
  { label: "Tickets", icon: "▤", path: "/tickets" },
  { label: "Invitation", icon: "▷", path: "/invites" },
];

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
    isActive
      ? "bg-[#24345d] text-[#a9bcff]"
      : "text-slate-400 hover:bg-[#17223b] hover:text-white"
  }`;

const accents = ["#4a7cff", "#2ecf8e", "#f5a623", "#a78bfa", "#fb7185", "#38bdf8"];

const accentFor = (text = "") => {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return accents[sum % accents.length];
};

const titleCase = (text = "") =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

/* "Supriyo Maity" -> "SM"; a single word -> its first two letters */
const initialsOf = (name = "") => {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0] || "U").slice(0, 2).toUpperCase();
};

/* Reads the logged-in user saved at login (same storage the other pages use) */
const readStoredUser = () => {
  try {
    const fromStorage = tokenStorage.getUser?.();
    if (fromStorage) return fromStorage;
  } catch {
    /* fall through */
  }
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getAccount = () => {
  const u = readStoredUser() || {};
  const email = u.email ?? u.user?.email ?? "";
  const rawName = u.name ?? u.full_name ?? u.user?.name ?? "";
  const name = titleCase(
    rawName || (email ? email.split("@")[0].replace(/[._-]+/g, " ") : "")
  );
  const role = String(u.role ?? u.user_role ?? "").toUpperCase();

  return {
    name: name || "Your Account",
    initials: name ? initialsOf(name) : "YO",
    // ADMIN -> "Admin", EMPLOYEE -> "Employee"; shows "Account profile" if no role is stored
    designation: role ? titleCase(role.replace(/[_-]+/g, " ")) : "Account profile",
    isAdmin: role === "ADMIN",
    color: accentFor(email || name || "user"),
  };
};

export default function Sidebar({
  mobile = false,
  onNavigate = () => {},
}) {
  const navigate = useNavigate();
  const account = getAccount();

  const handleLogout = () => {
    tokenStorage.clearSession?.();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    onNavigate();
    navigate("/", { replace: true });
  };

  return (
    <aside
      className={`flex h-screen w-56 flex-col overflow-y-auto border-r border-[#202943] bg-[#0c1427] px-4 py-5 text-white ${
        mobile ? "w-full" : "w-56"
      }`}
    >
      {/* Brand */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6482ff] to-[#4558df] text-lg font-bold">
            ✓
          </span>

          <span className="text-lg font-bold tracking-tight">
            Relay
          </span>
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-300 hover:bg-[#17223b] hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Organization */}
      <p className="mb-2 truncate px-2 text-[10px] font-bold tracking-widest text-slate-500">
        RELAY WORKSPACE
      </p>

      {/* Main navigation */}
      <nav aria-label="Main navigation" className="space-y-1">
        {mainItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            onClick={onNavigate}
            className={linkClasses}
          >
            <span className="w-4 shrink-0 text-center text-base">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <p className="mb-2 mt-8 px-2 text-[10px] font-bold tracking-widest text-slate-500">
        SETTINGS
      </p>

      <nav aria-label="Settings navigation" className="space-y-1">
        <NavLink
          to="/preferences"
          onClick={onNavigate}
          className={linkClasses}
        >
          <span className="w-4 shrink-0 text-center">⚙</span>
          <span>Preferences</span>
        </NavLink>

        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={linkClasses}
        >
          <span className="w-4 shrink-0 text-center">♙</span>
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* User and logout */}
      <div className="mt-auto pt-8">
        <Link
          to="/profile"
          onClick={onNavigate}
          title={`${account.name} · ${account.designation}`}
          className="mb-4 flex items-center gap-3 rounded-lg border-t border-[#202943] px-1 pt-4 transition hover:opacity-90"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#08101e]"
            style={{ backgroundColor: account.color }}
          >
            {account.initials}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {account.name}
            </p>
            <p
              className={`truncate text-xs ${
                account.isAdmin ? "text-blue-300" : "text-slate-500"
              }`}
            >
              {account.designation}
            </p>
          </div>
        </Link>

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
