import axios from "axios";

const API_BASE = "http://localhost:7777/api";

export const fetchRestaurants = async (gu = "", uptae = "", name = "") => {
  const params = {};
  if (gu) params.gu = gu;
  if (uptae) params.uptae = uptae;
  if (name) params.name = name;

  const response = await axios.get(`${API_BASE}/model_restaurant`, { params });
  return response.data;
};

export const fetchFilterOptions = async () => {
  const response = await axios.get(`${API_BASE}/filter_options`);
  return response.data;
};
