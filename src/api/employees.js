
import axiosInstance from "./axiosInstance";

// Get employees from the logged-in Admin's organization
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

// Deactivate an employee
export const deactivateEmployee = async (userId) => {
  if (!userId) {
    throw new Error("Employee ID is required.");
  }

  const response = await axiosInstance.patch(
    `/api/employees/${userId}/status`,
    {
      account_status: "INACTIVE",
    }
  );

  if (response.data?.success === false) {
    throw new Error(
      response.data?.message || "Unable to deactivate employee."
    );
  }

  return response.data;
};
