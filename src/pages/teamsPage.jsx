
export default function Teams() {
  const members = [
    { name: "Dev Kapoor", initials: "DK", role: "Developer" },
    { name: "Rosa Silva", initials: "RS", role: "Support Engineer" },
    { name: "Mara Patel", initials: "MP", role: "Project Member" },
    { name: "You", initials: "YO", role: "Support Lead" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        Workspace / Teams
      </p>
      <h1 className="mt-2 text-3xl font-bold">Teams</h1>
      <p className="mt-2 text-sm text-slate-400">
        View your team members and their roles.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div key={member.name} className="flex items-center gap-4 rounded-xl border border-[#1d2944] bg-[#111d36] p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 font-bold text-blue-300">
              {member.initials}
            </div>
            <div>
              <h2 className="font-semibold">{member.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
