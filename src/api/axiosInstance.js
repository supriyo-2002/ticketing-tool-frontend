

// import axios from "axios";
// import { tokenStorage } from "../utils/tokenStorage";

// const baseURL = import.meta.env.VITE_API_BASE_URL;

// if (!baseURL) {
//   console.error("VITE_API_BASE_URL is missing. Check your .env file.");
// }

// const axiosInstance = axios.create({
//   baseURL,
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = tokenStorage.getAccessToken();

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.code === "ECONNABORTED") {
//       console.error("API request timed out:", error.config?.url);
//     } else {
//       console.error(
//         "API Error:",
//         error.response?.status,
//         error.config?.url,
//         error.response?.data || error.message
//       );
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const baseURL = import.meta.env.BACKEND_API_BASE_URL;

if (!baseURL) {
  console.error("BACKEND_API_BASE_URL is missing. Check your .env file.");
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

// Dedupe identical GETs that overlap or fire again within a short window
// (e.g. dashboard remount right after login).
const inflightGets = new Map();
const recentGets = new Map();
const GET_CACHE_MS = 5000;

const getKey = (url, config = {}) => {
  const params = config.params ? JSON.stringify(config.params) : "";
  const token = tokenStorage.getAccessToken() || "";
  return `${token}|${url}?${params}`;
};

const originalGet = axiosInstance.get.bind(axiosInstance);

axiosInstance.get = (url, config = {}) => {
  const key = getKey(url, config);
  const now = Date.now();

  const cached = recentGets.get(key);
  if (cached && now - cached.at < GET_CACHE_MS) {
    return Promise.resolve(cached.response);
  }

  const existing = inflightGets.get(key);
  if (existing) {
    return existing;
  }

  const request = originalGet(url, config)
    .then((response) => {
      recentGets.set(key, { at: Date.now(), response });
      return response;
    })
    .finally(() => {
      if (inflightGets.get(key) === request) {
        inflightGets.delete(key);
      }
    });

  inflightGets.set(key, request);
  return request;
};

export const clearAxiosGetCache = () => {
  inflightGets.clear();
  recentGets.clear();
};

export default axiosInstance;