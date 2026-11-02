
import axiosInstance from "./axiosInstance";

export const getEmployees = async () => {
  try {
    const response = await axiosInstance.get("/api/employees");
    return response.data;
  } catch (error) {
    console.error(
      "Get employees API error:",
      error.response?.data || error.message
    );

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Please log in again.");
    }

    if (status === 403) {
      throw new Error("You don't have permission to view employees.");
    }

    if (!error.response) {
      throw new Error("Cannot connect to the server.");
    }

    throw new Error(message || "Failed to fetch employees.");
  }
};
