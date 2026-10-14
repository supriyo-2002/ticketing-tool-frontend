
export default function Tickets() {
  const tickets = [
    { id: "TCK-1042", title: "Checkout page fails on Safari", status: "In progress", priority: "High" },
    { id: "TCK-1039", title: "Warehouse scanner connection issue", status: "Open", priority: "Critical" },
    { id: "TCK-1035", title: "Add CSV export for shipment history", status: "Open", priority: "Medium" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        Workspace / Tickets
      </p>
      <h1 className="mt-2 text-3xl font-bold">Tickets</h1>
      <p className="mt-2 text-sm text-slate-400">
        Review and track reported issues.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-[#1d2944] bg-[#111d36]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Ticket</th>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Priority</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-[#202943]">
                <td className="p-4 text-slate-400">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">{ticket.status}</td>
                <td className="p-4">{ticket.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
