// import { Link, NavLink, useNavigate } from "react-router-dom";

// const mainItems = [
//   { label: "Overview", icon: "▦", path: "/dashboard" },
//   { label: "Projects", icon: "▱", path: "/projects" },
//   { label: "Tickets", icon: "▤", path: "/tickets" },
//   { label: "Invitation", icon: "✉\uFE0E", path: "/invites" },
// ];

// const linkClasses = ({ isActive }) =>
//   `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
//     isActive
//       ? "bg-[#24345d] text-[#a9bcff]"
//       : "text-slate-400 hover:bg-[#17223b] hover:text-white"
//   }`;

// export default function Sidebar() {
//   const navigate = useNavigate();

//   // Deletes the saved login and goes back to the login page
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     sessionStorage.clear();
//     navigate("/", { replace: true });
//   };

//   return (
//     <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-[#202943] bg-[#0c1427] px-4 py-5 text-white">
//       <Link
//         to="/dashboard"
//         className="mb-8 flex items-center gap-2.5 px-1"
//       >
//         <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6482ff] to-[#4558df] text-lg font-bold">
//           ✓
//         </span>
//         <span className="text-lg font-bold tracking-tight">Relay</span>
//       </Link>

//       <p className="mb-2 px-2 text-[10px] font-bold tracking-widest text-slate-500">
//         NORTHWIND LOGISTICS
//       </p>

//       <nav className="space-y-1">
//         {mainItems.map((item) => (
//           <NavLink key={item.path} to={item.path} className={linkClasses}>
//             <span className="w-4 text-center text-base">{item.icon}</span>
//             {item.label}
//           </NavLink>
//         ))}
//       </nav>

//       <p className="mb-2 mt-8 px-2 text-[10px] font-bold tracking-widest text-slate-500">
//         SETTINGS
//       </p>

//       <NavLink to="/preferences" className={linkClasses}>
//         <span className="w-4 text-center">⚙</span>
//         Preferences
//       </NavLink>

//       {/* Bottom section: user + log out */}
//       <div className="mt-auto border-t border-[#202943] pt-4">
//         <div className="mb-3 flex items-center gap-3 px-1">
//           <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-slate-950">
//             YO
//           </span>
//           <NavLink
//   to="/profile"
//   className={({ isActive }) =>
//     `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
//       isActive
//         ? "bg-[#25365c] text-white"
//         : "text-slate-400 hover:bg-[#172440] hover:text-white"
//     }`
//   }
// >
//   <span aria-hidden="true">♙</span>
//   <span>Profile</span>
// </NavLink>
//         </div>

//         <button
//           type="button"
//           onClick={handleLogout}
//           className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#202943] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
//         >
//           <svg
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             className="h-4 w-4"
//             aria-hidden="true"
//           >
//             <path
//               d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//           Log out
//         </button>
//       </div>
//     </aside>
//   );
// }

import { Link, NavLink, useNavigate } from "react-router-dom";

const mainItems = [
  { label: "Overview", icon: "▦", path: "/dashboard" },
  { label: "Projects", icon: "▱", path: "/projects" },
  { label: "Tickets", icon: "▤", path: "/tickets" },
  { label: "Invitation", icon: "✉", path: "/invites" },
];

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
    isActive
      ? "bg-[#24345d] text-[#a9bcff]"
      : "text-slate-400 hover:bg-[#17223b] hover:text-white"
  }`;

export default function Sidebar({
  mobile = false,
  onNavigate = () => {},
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
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
        NORTHWIND LOGISTICS
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
        <div className="mb-4 flex items-center gap-3 border-t border-[#202943] px-1 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-slate-950">
            YO
          </span>

          <div className="min-w-0">
            <p className="text-sm font-medium text-white">
              Your Account
            </p>
            <p className="text-xs text-slate-500">
              Account profile
            </p>
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
