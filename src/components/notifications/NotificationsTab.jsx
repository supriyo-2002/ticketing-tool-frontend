
export default function NotificationTabs({ activeTab, onChange }) {
  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-[#080d18] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-3 py-2 text-xs font-medium transition ${
            activeTab === tab.id
              ? "bg-[#263b63] text-white shadow"
              : "text-slate-400 hover:bg-[#17223b] hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
