
// export const normalizeProjectsResponse = (response) => {
//   if (!response?.success || !Array.isArray(response.data)) {
//     throw new Error("Invalid projects response.");
//   }

//   return response.data.map((project) => ({
//     project_id: project.project_id,
//     name: project.name,
//     description: project.description,
//   }));
// };


export const normalizeProjectsResponse = (response) => {
  if (!response?.success || !Array.isArray(response.data)) {
    throw new Error("Invalid projects response.");
  }

  return response.data.map((project) => ({
    ...project,

    project_id: project.project_id ?? project.id,
    name: project.name ?? project.project_name ?? "Untitled project",
    description: project.description ?? "",

    created_at:
      project.created_at ??
      project.createdAt ??
      null,

    members:
      project.members ??
      project.project_members ??
      project.member_ids ??
      [],

    status_id:
      project.status_id ??
      project.project_status_id ??
      project.status?.status_id ??
      project.project_status?.status_id ??
      "",
  }));
};
