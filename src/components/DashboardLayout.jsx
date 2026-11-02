
// import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";

// export default function DashboardLayout() {
//   return (
//     <div className="flex min-h-screen bg-[#080d18] text-[#f3f5fb]">
//       <div className="hidden md:block">
//         <Sidebar />
//       </div>

//       <main className="min-w-0 flex-1 p-5 sm:p-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// }


import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#080d18] text-[#f3f5fb]">
      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#202943] bg-[#0c1427] px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-white transition hover:bg-[#17223b]"
        >
          ☰
        </button>

        <span className="text-lg font-bold tracking-tight">Relay</span>

        <div className="h-10 w-10" aria-hidden="true" />
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 h-full w-full bg-black/60"
          />

          <div className="absolute inset-y-0 left-0 z-10 w-64 max-w-[85vw]">
            <Sidebar
              mobile
              onNavigate={closeMobileMenu}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="min-w-0 p-4 sm:p-6 md:ml-56 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
