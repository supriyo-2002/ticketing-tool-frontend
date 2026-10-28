import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL;

console.log("API Base URL:", baseURL);

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach the token to protected API requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;