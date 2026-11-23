
import axiosInstance from "./axiosInstance";

export const getEmployees = async () => {
  const response = await axiosInstance.get("/api/employees");

  if (response.data?.success !== true) {
    throw new Error(
      response.data?.message || "Unable to retrieve employees."
    );
  }

  return Array.isArray(response.data.data)
    ? response.data.data
    : [];
};
