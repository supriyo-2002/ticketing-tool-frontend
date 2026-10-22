export default function Projects() {
  const projects = [
    { name: "Storefront Web", description: "Website and checkout experience", status: "Active" },
    { name: "Warehouse Portal", description: "Warehouse and shipment operations", status: "Active" },
    { name: "Mobile App", description: "Mobile application and notifications", status: "Planning" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        Workspace / Projects
      </p>
      <h1 className="mt-2 text-3xl font-bold">Projects</h1>
      <p className="mt-2 text-sm text-slate-400">
        View and manage your workspace projects.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div key={project.name} className="rounded-xl border border-[#1d2944] bg-[#111d36] p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold">{project.name}</h2>
              <span className="rounded-full bg-blue-500/15 px-2 py-1 text-xs text-blue-300">
                {project.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
