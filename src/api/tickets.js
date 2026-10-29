
import axiosInstance from "./axiosInstance";

// Fetch tickets from the backend
export const getTickets = async () => {
  try {
    const response = await axiosInstance.get("/api/tickets");
    return response.data;
  } catch (error) {
    console.error(
      "Get tickets API error:",
      error.response?.data || error.message
    );

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Please log in again.");
    }

    if (status === 403) {
      throw new Error(
        "You don't have permission to view tickets."
      );
    }

    if (status === 404) {
      throw new Error("Ticket API endpoint not found.");
    }

    if (!error.response) {
      throw new Error(
        "Cannot connect to the server. Check your API configuration."
      );
    }

    throw new Error(message || "Failed to fetch tickets.");
  }
};

// Create a new ticket
export const createTicket = async (ticketData) => {
  try {
    // Log the exact data being sent
    console.log("Create ticket payload:", ticketData);

    const response = await axiosInstance.post(
      "/api/tickets",
      ticketData
    );

    console.log(
      "Create ticket API response:",
      response.data
    );

    return response.data;
  } catch (error) {
    // Log the backend's actual response
    console.error(
      "Create ticket backend error:",
      error.response?.data || error.message
    );

    console.error(
      "Create ticket HTTP status:",
      error.response?.status
    );

    console.error(
      "Create ticket submitted payload:",
      ticketData
    );

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Please log in again.");
    }

    if (status === 403) {
      throw new Error(
        "You don't have permission to create tickets."
      );
    }

    if (status === 404) {
      throw new Error("Ticket API endpoint not found.");
    }

    if (!error.response) {
      throw new Error(
        "Cannot connect to the server. Check your API configuration."
      );
    }

    throw new Error(
      message || "Failed to create ticket. Please try again."
    );
  }
};
