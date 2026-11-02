
import axiosInstance from "./axiosInstance";
import { normalizeProjectsResponse } from "../models/projectModel.js";

export const getProjects = async () => {
  const response = await axiosInstance.get("/api/projects");

  return normalizeProjectsResponse(response.data);
};
