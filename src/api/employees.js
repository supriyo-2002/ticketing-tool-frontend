
import axiosInstance from "./axiosInstance";

// ======================================
// API ERROR HANDLER
// ======================================

const toApiError = (error, fallback, permissionText) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 401) {
    return new Error("Please log in again.");
  }

  if (status === 403) {
    return new Error(permissionText);
  }

  if (!error.response) {
    return new Error("Cannot connect to the server.");
  }

  return new Error(message || fallback);
};

// ======================================
// GET ALL EMPLOYEES
// ======================================

export const getEmployees = async () => {
  try {
    const response = await axiosInstance.get("/api/employees", {
      headers: {
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Get employees API error:",
      error.response?.data || error.message
    );

    throw toApiError(
      error,
      "Failed to fetch employees.",
      "You don't have permission to view employees."
    );
  }
};

// ======================================
// UPDATE EMPLOYEE STATUS
// ======================================

const updateEmployeeStatus = async (userId, accountStatus) => {
  if (!userId) {
    throw new Error("Employee ID is required.");
  }

  if (!["ACTIVE", "INACTIVE"].includes(accountStatus)) {
    throw new Error("Invalid employee status.");
  }

  const response = await axiosInstance.patch(
    `/api/employees/${userId}/status`,
    {
      account_status: accountStatus,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};

// ======================================
// DEACTIVATE EMPLOYEE
// ======================================

export const deactivateEmployee = async (userId) => {
  try {
    return await updateEmployeeStatus(userId, "INACTIVE");
  } catch (error) {
    console.error(
      "Deactivate employee API error:",
      error.response?.data || error.message
    );

    throw toApiError(
      error,
      "Failed to deactivate employee.",
      "You don't have permission to deactivate employees."
    );
  }
};

// ======================================
// ACTIVATE EMPLOYEE
// ======================================

export const activateEmployee = async (userId) => {
  try {
    return await updateEmployeeStatus(userId, "ACTIVE");
  } catch (error) {
    console.error(
      "Activate employee API error:",
      error.response?.data || error.message
    );

    throw toApiError(
      error,
      "Failed to activate employee.",
      "You don't have permission to activate employees."
    );
  }
};
