



// import axiosInstance from "./axiosInstance";

// // Fetch all tickets from the backend
// export const getTickets = async () => {
//   try {
//     const response = await axiosInstance.get("/api/tickets");

//     console.log("Get tickets API response:", response.data);

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Get tickets API error:",
//       error.response?.data || error.message
//     );

//     const status = error.response?.status;
//     const message = error.response?.data?.message;

//     if (status === 401) {
//       throw new Error("Please log in again.");
//     }

//     if (status === 403) {
//       throw new Error(
//         "You don't have permission to view tickets."
//       );
//     }

//     if (status === 404) {
//       throw new Error("Ticket API endpoint not found.");
//     }

//     if (!error.response) {
//       throw new Error(
//         "Cannot connect to the server. Check your API configuration."
//       );
//     }

//     throw new Error(message || "Failed to fetch tickets.");
//   }
// };

// // Create a new ticket
// export const createTicket = async (ticketData) => {
//   try {
//     console.log("Create ticket payload:", ticketData);

//     const response = await axiosInstance.post(
//       "/api/tickets",
//       ticketData
//     );

//     console.log(
//       "Create ticket API response:",
//       response.data
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Create ticket backend error:",
//       error.response?.data || error.message
//     );

//     console.error(
//       "Create ticket HTTP status:",
//       error.response?.status
//     );

//     console.error(
//       "Create ticket submitted payload:",
//       ticketData
//     );

//     const status = error.response?.status;
//     const message = error.response?.data?.message;

//     if (status === 400) {
//       throw new Error(
//         message || "Invalid ticket details. Please check the form."
//       );
//     }

//     if (status === 401) {
//       throw new Error("Please log in again.");
//     }

//     if (status === 403) {
//       throw new Error(
//         "You don't have permission to create tickets."
//       );
//     }

//     if (status === 404) {
//       throw new Error("Ticket API endpoint not found.");
//     }

//     if (!error.response) {
//       throw new Error(
//         "Cannot connect to the server. Check your API configuration."
//       );
//     }

//     throw new Error(
//       message || "Failed to create ticket. Please try again."
//     );
//   }
// };

// // Delete a ticket from the backend
// export const deleteTicket = async (ticketId) => {
//   try {
//     if (!ticketId) {
//       throw new Error("Ticket ID is required to delete a ticket.");
//     }

//     console.log("Deleting ticket:", ticketId);

//     const response = await axiosInstance.delete(
//       `/api/tickets/${encodeURIComponent(ticketId)}`
//     );

//     console.log(
//       "Delete ticket API response:",
//       response.data
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Delete ticket backend error:",
//       error.response?.data || error.message
//     );

//     console.error(
//       "Delete ticket HTTP status:",
//       error.response?.status
//     );

//     const status = error.response?.status;
//     const message = error.response?.data?.message;

//     if (status === 400) {
//       throw new Error(
//         message || "Invalid request. The ticket could not be deleted."
//       );
//     }

//     if (status === 401) {
//       throw new Error("Please log in again.");
//     }

//     if (status === 403) {
//       throw new Error(
//         "You don't have permission to delete tickets."
//       );
//     }

//     if (status === 404) {
//       throw new Error(
//         message || "Ticket not found or delete endpoint unavailable."
//       );
//     }

//     if (status === 405) {
//       throw new Error(
//         "The backend does not support this DELETE request."
//       );
//     }

//     if (!error.response) {
//       throw new Error(
//         "Cannot connect to the server. Check your API configuration."
//       );
//     }

//     throw new Error(message || "Failed to delete ticket.");
//   }
// };


import axiosInstance from "./axiosInstance";

// ==========================================
// GET ALL TICKETS
// ==========================================
export const getTickets = async () => {
  try {
    const response = await axiosInstance.get("/api/tickets");

    console.log("Get tickets API response:", response.data);

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

// ==========================================
// CREATE NEW TICKET
// ==========================================
export const createTicket = async (ticketData) => {
  try {
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

    if (status === 400) {
      throw new Error(
        message || "Invalid ticket details. Please check the form."
      );
    }

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

// ==========================================
// UPDATE EXISTING TICKET
// ==========================================
export const updateTicket = async (ticketId, ticketData) => {
  try {
    if (!ticketId) {
      throw new Error(
        "Ticket ID is required to update a ticket."
      );
    }

    console.log("Updating ticket:", ticketId);
    console.log("Update ticket payload:", ticketData);

    const response = await axiosInstance.put(
      `/api/tickets/${encodeURIComponent(ticketId)}`,
      ticketData
    );

    console.log(
      "Update ticket API response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update ticket backend error:",
      error.response?.data || error.message
    );

    console.error(
      "Update ticket HTTP status:",
      error.response?.status
    );

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 400) {
      throw new Error(
        message || "Invalid ticket details."
      );
    }

    if (status === 401) {
      throw new Error("Please log in again.");
    }

    if (status === 403) {
      throw new Error(
        "You don't have permission to update tickets."
      );
    }

    if (status === 404) {
      throw new Error(
        message || "Ticket not found or update endpoint unavailable."
      );
    }

    if (status === 405) {
      throw new Error(
        "The backend does not support this update method."
      );
    }

    if (!error.response) {
      throw new Error(
        "Cannot connect to the server. Check your API configuration."
      );
    }

    throw new Error(
      message || "Failed to update ticket. Please try again."
    );
  }
};

// ==========================================
// DELETE TICKET
// ==========================================
export const deleteTicket = async (ticketId) => {
  try {
    if (!ticketId) {
      throw new Error(
        "Ticket ID is required to delete a ticket."
      );
    }

    console.log("Deleting ticket:", ticketId);

    const response = await axiosInstance.delete(
      `/api/tickets/${encodeURIComponent(ticketId)}`
    );

    console.log(
      "Delete ticket API response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete ticket backend error:",
      error.response?.data || error.message
    );

    console.error(
      "Delete ticket HTTP status:",
      error.response?.status
    );

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 400) {
      throw new Error(
        message || "Invalid request. The ticket could not be deleted."
      );
    }

    if (status === 401) {
      throw new Error("Please log in again.");
    }

    if (status === 403) {
      throw new Error(
        "You don't have permission to delete tickets."
      );
    }

    if (status === 404) {
      throw new Error(
        message || "Ticket not found or delete endpoint unavailable."
      );
    }

    if (status === 405) {
      throw new Error(
        "The backend does not support this DELETE request."
      );
    }

    if (!error.response) {
      throw new Error(
        "Cannot connect to the server. Check your API configuration."
      );
    }

    throw new Error(
      message || "Failed to delete ticket."
    );
  }
};
