
import axiosInstance from "./axiosInstance";

export const getStatuses = async () => {
  const response = await axiosInstance.get("/api/statuses");
  return response.data;
};
