
export default function NotificationEmpty({ activeTab }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#26324b] bg-[#111c32]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8 text-slate-400"
          aria-hidden="true"
        >
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.7 21a2 2 0 0 1-3.4 0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3 className="text-sm font-semibold text-white">
        {activeTab === "unread"
          ? "You're all caught up!"
          : "No notifications yet"}
      </h3>

      <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
        {activeTab === "unread"
          ? "You don't have any unread notifications right now."
          : "When you receive updates about your tickets and projects, they'll appear here."}
      </p>
    </div>
  );
}
