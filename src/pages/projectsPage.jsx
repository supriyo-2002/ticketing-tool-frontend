
import { useEffect, useState } from "react";
import { getProjects } from "../api/project.js";
import { toast } from "react-toastify";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProjects();

        if (active) {
          setProjects(result.projects);
        }
      } catch (err) {
        if (active) {
          const message =
            err?.message || "Unable to load projects. Please try again.";

          setError(message);

          toast.error(message, {
            position: "top-right",
            autoClose: 4000,
            theme: "dark",
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        Workspace / Projects
      </p>

      <h1 className="mt-2 text-3xl font-bold">Projects</h1>

      <p className="mt-2 text-sm text-slate-400">
        View and manage your workspace projects.
      </p>

      {/* Loading state */}
      {loading && (
        <p className="mt-8 text-sm text-slate-400">
          Loading projects...
        </p>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-sm text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-[#1d2944] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#293959]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="mt-8 rounded-xl border border-[#1d2944] bg-[#111d36] p-5">
          <p className="text-sm text-slate-400">
            No projects found.
          </p>
        </div>
      )}

      {/* Projects from API */}
      {!loading && !error && projects.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.project_id}
              className="rounded-xl border border-[#1d2944] bg-[#111d36] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold">
                  {project.name}
                </h2>

                <span className="rounded-full bg-blue-500/15 px-2 py-1 text-xs text-blue-300">
                  Active
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {project.description || "No description available."}
              </p>

              {/* Project members */}
              <div className="mt-4 border-t border-[#1d2944] pt-3">
                <p className="text-xs font-medium text-slate-300">
                  Members ({project.members?.length || 0})
                </p>

                {project.members?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {project.members.map((member) => (
                      <div
                        key={member.user_id}
                        className="text-sm"
                      >
                        <p className="text-slate-300">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {member.role}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
