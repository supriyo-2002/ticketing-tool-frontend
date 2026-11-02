
export const normalizeProjectsResponse = (response) => {
  if (!response?.success || !Array.isArray(response.data)) {
    throw new Error("Invalid projects response.");
  }

  return response.data.map((project) => ({
    project_id: project.project_id,
    name: project.name,
    description: project.description,
  }));
};
