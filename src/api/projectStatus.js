
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

  if (!response.ok || body.success === false) {
    throw new Error(
      body.message || "Failed to fetch project statuses."
    );
  }

  return Array.isArray(body.data) ? body.data : [];
};
