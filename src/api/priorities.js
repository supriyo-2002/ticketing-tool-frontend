
import axiosInstance from "./axiosInstance";

export const getPriorities = async () => {
  const response = await axiosInstance.get("/api/priorities");
  return response.data;
};
