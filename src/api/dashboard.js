
import axiosInstance from "./axiosInstance";

export const getDashboardStats = async () => {
  const response = await axiosInstance.get("/api/dashboard");
  return response.data.data;
};
