// src/api/profile.js

import { tokenStorage } from "../utils/tokenStorage.js";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

// Confirm these routes with your backend before using them.
const PROFILE_ENDPOINT = "/api/auth/me";
const UPDATE_PROFILE_ENDPOINT = "/api/auth/profile";

async function profileRequest(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("The API base URL is missing from your .env file.");
  }

  const token = tokenStorage.getAccessToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Profile request failed (${response.status}).`
    );
  }

  return result;
}

export function getMyProfile() {
  return profileRequest(PROFILE_ENDPOINT);
}

export function updateMyProfile({ fullName, organizationName }) {
  return profileRequest(UPDATE_PROFILE_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify({
      full_name: fullName,
      organization_name: organizationName,
    }),
  });
}