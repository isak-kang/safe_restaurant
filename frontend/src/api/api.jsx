import axios from 'axios';

const API_URL = "http://localhost:7777/api/model_restaurant";

export const fetchRestaurants = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("데이터 로딩 실패:", error);
    throw error;
  }
};