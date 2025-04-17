import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_ADDR;

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

export const fetchRestaurantByName = async (upso_nm) => {
  const response = await axios.get(`${API_BASE}/model_restaurant/${encodeURIComponent(upso_nm)}`);
  return response.data;
};

export const fetchMapData = async (address) => {
  const response = await axios.get(`${API_BASE}/get_gocode`,{ params: { address: address } });
  return response.data;
};

export const fetchMainMap = async (gu = "") => {
  const params = {};
  if (gu) params.gu = gu;

  const response = await axios.get(`${API_BASE}/main_map`, { params });
  return response.data;
};