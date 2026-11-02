
import axiosInstance from "./axiosInstance";

import {
  createLoginRequest,
  normalizeLoginResponse,
  createRegistrationRequest,
  normalizeRegistrationResponse,
} from "../models/authModels";

import { tokenStorage } from "../utils/tokenStorage";

// ======================================
// LOGIN SERVICE
// POST /api/auth/login
// ======================================

export const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim();

  if (!normalizedEmail || !password) {
    throw new Error("Please enter your email and password.");
  }

  try {
    const requestBody = createLoginRequest(
      normalizedEmail,
      password
    );

    const response = await axiosInstance.post(
      "/api/auth/login",
      requestBody
    );

    const result = normalizeLoginResponse(response.data);

    // Save the session only after successful login.
    tokenStorage.saveSession(result.session, result.user);

    return {
      user: result.user,
      message: result.message,
    };
  } catch (error) {
    tokenStorage.clearSession();

    // Handle errors returned by the backend.
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      if (status === 400) {
        throw new Error(
          serverMessage || "Please check your login details."
        );
      }

      if (status === 401 || status === 403) {
        throw new Error(
          serverMessage || "Invalid email or password."
        );
      }

      if (status === 429) {
        throw new Error(
          "Too many login attempts. Please try again later."
        );
      }

      if (status >= 500) {
        throw new Error(
          "The server is temporarily unavailable. Please try again."
        );
      }

      throw new Error(
        serverMessage || `Login failed with status ${status}.`
      );
    }

    // Handle network and timeout errors.
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "The login request timed out. Please try again."
      );
    }

    if (error.code === "ERR_NETWORK" || !error.response) {
      throw new Error(
        "Cannot connect to the server. Check the API URL, internet connection, and backend CORS configuration."
      );
    }

    throw new Error(
      error.message || "Something went wrong during login."
    );
  }
};

// ======================================
// ORGANIZATION REGISTRATION SERVICE
// POST /api/auth/register-organization
// ======================================

export const registerOrganization = async (formData) => {
  // Validate and prepare the registration request.
  // Expected fields: name, email, password, organizationName.
  const requestBody = createRegistrationRequest(formData);

  try {
    const response = await axiosInstance.post(
      "/api/auth/register-organization",
      requestBody
    );

    // Validate and normalize the backend response.
    const result = normalizeRegistrationResponse(response.data);

    // Registration does not log the user in.
    // Do not save a session or token here.
    return result;
  } catch (error) {
    // Handle validation or response-normalization errors.
    if (!error.isAxiosError) {
      throw error;
    }

    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    // Prefer the backend's actual error message when available.
    if (serverMessage) {
      throw new Error(serverMessage);
    }

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Registration request timed out. Please try again."
      );
    }

    if (!error.response) {
      throw new Error(
        "Cannot connect to the server. Check your internet connection, API URL, or backend CORS configuration."
      );
    }

    if (status === 400) {
      throw new Error(
        "Invalid registration details. Please check the form."
      );
    }

    if (status === 409) {
      throw new Error(
        "This email or organization may already be registered."
      );
    }

    if (status === 422) {
      throw new Error(
        "Some registration details are invalid. Please check them."
      );
    }

    if (status === 429) {
      throw new Error(
        "Too many registration attempts. Please try again later."
      );
    }

    if (status >= 500) {
      throw new Error(
        "The server is temporarily unavailable. Please try again later."
      );
    }

    throw new Error(
      `Registration failed with status ${status ?? "unknown"}.`
    );
  }
};
