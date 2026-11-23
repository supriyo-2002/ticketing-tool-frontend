
import { tokenStorage } from "../utils/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const token = tokenStorage.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response) => {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response received from the server.");
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || "Something went wrong. Please try again."
    );
  }

  return result;
};

// 1. Get notifications
export const getNotifications = async (page = 1, limit = 20) => {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// 2. Get unread notification count
export const getUnreadCount = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/unread-count`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const result = await handleResponse(response);

  return result.unread_count ?? 0;
};

// 3. Mark one notification as read
export const markAsRead = async (notificationId) => {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// 4. Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/read-all`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// 5. Delete one notification
export const deleteNotification = async (notificationId) => {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};
