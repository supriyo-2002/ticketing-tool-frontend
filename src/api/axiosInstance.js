// import axios from "axios";
// import { tokenStorage } from "../utils/tokenStorage";

// const baseURL = import.meta.env.VITE_API_BASE_URL;

// console.log("API Base URL:", baseURL);

// const axiosInstance = axios.create({
//   baseURL: baseURL,
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// // Attach the token to protected API requests
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = tokenStorage.getAccessToken();

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default axiosInstance;

import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.error("VITE_API_BASE_URL is missing. Check your .env file.");
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("API request timed out:", error.config?.url);
    } else {
      console.error(
        "API Error:",
        error.response?.status,
        error.config?.url,
        error.response?.data || error.message
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
