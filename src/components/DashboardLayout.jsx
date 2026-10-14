
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#080d18] text-[#f3f5fb]">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
