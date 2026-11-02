// src/utils/tokenStorage.js

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";
const EXPIRES_AT_KEY = "token_expires_at";

export const tokenStorage = {
  saveSession(session, user) {
    if (!session?.access_token) {
      throw new Error("Cannot save session without an access token.");
    }

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      session.access_token
    );

    // Store only if supplied by the API.
    if (session.refresh_token) {
      localStorage.setItem(
        REFRESH_TOKEN_KEY,
        session.refresh_token
      );
    }

    if (session.expires_at != null) {
      localStorage.setItem(
        EXPIRES_AT_KEY,
        String(session.expires_at)
      );
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getExpiresAt() {
    const value = localStorage.getItem(EXPIRES_AT_KEY);
    return value ? Number(value) : null;
  },

  clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  },
};