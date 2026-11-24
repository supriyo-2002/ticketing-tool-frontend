
// import { tokenStorage } from "../utils/tokenStorage";

// const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// export const getProjectStatuses = async () => {
//   const token = tokenStorage.getAccessToken();

//   const response = await fetch(`${API}/api/projects/statuses`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   });

//   const body = await response.json().catch(() => ({}));

//   if (!response.ok || body.success === false) {
//     throw new Error(
//       body.message || "Failed to fetch project statuses."
//     );
//   }

//   return Array.isArray(body.data) ? body.data : [];
// };


import { tokenStorage } from "../utils/tokenStorage";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const getProjectStatuses = async () => {
  const token = tokenStorage.getAccessToken();

  const response = await fetch(`${API}/api/projects/statuses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  console.log("Project statuses response:", body);

  if (!response.ok || body.success === false) {
    throw new Error(
      body.message || "Failed to fetch project statuses."
    );
  }

  const data =
    Array.isArray(body.data) ? body.data :
    Array.isArray(body.data?.statuses) ? body.data.statuses :
    Array.isArray(body.statuses) ? body.statuses :
    [];

  return data.map((item) => ({
    ...item,
    status_id: item.status_id ?? item.id,
    name: item.name ?? item.status_name ?? item.label ?? "",
  })).filter((item) => item.status_id && item.name);
};
