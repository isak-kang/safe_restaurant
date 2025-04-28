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

export const fetchRestaurantsRecommendScore = async () => {

  const response = await axios.get(`${API_BASE}/recommend_score`);
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

export const fetchPhoto = async (upso = "") => {
  const params = {};
  if (upso) params.upso = upso;
  
  const response = await axios.get(`${API_BASE}/restaurant_photo`, { params });
  return response.data;
};

export const fetchStopRestaurant = async () => {
  const response = await axios.get(`${API_BASE}/tb_restaurant_hygiene`);
  return response.data;
};


export const fetchStopRestaurantByName = async (upso_nm) => {
  const response = await axios.get(`${API_BASE}/tb_restaurant_hygiene/${encodeURIComponent(upso_nm)}`);
  return response.data;
};


export const registerUser = async (formData) => {
  const response = await axios.post(
    `${API_BASE}/join`,
    new URLSearchParams(formData),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
};


export const login = async (formData) => {
  const response = await axios.post(
    `${API_BASE}/login`,
    new URLSearchParams(formData),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  
  // 토큰을 로컬 스토리지에 저장
  if (response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
  }
  
  return response.data;
};




// /protected 라우트 호출
export const getProtectedData = async () => {
  const token = localStorage.getItem('access_token'); // 로컬 스토리지에서 토큰 가져오기
  
  if (!token) {
    throw new Error('로그인되어 있지 않습니다.'); // 토큰이 없으면 에러 처리
  }
  
  try {
    const response = await axios.get(`${API_BASE}/protected`, {
      headers: {
        Authorization: `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 담기
      },
    });
    
    return response.data; // 서버로부터 응답 데이터 반환 data = {user = {"id" : 123}}
  } catch (error) {
    console.error('Error fetching protected data:', error);
    throw error; // 오류 발생 시 처리
  }
};

// 즐겨찾기 추가
export const addFavorite = async (upso_nm) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("로그인되어 있지 않습니다.");

  // 서버가 fav: { upso_nm: string } 형태를 기대하므로 객체로 감싸 전달
  const payload = { upso_nm };

  const response = await axios.post(
    `${API_BASE}/favorites`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data; // { message: "즐겨찾기 추가 완료" }
};

// 즐겨찾기 삭제
export const deleteFavorite = async (upso_nm) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("로그인되어 있지 않습니다.");

  const response = await axios.delete(
    `${API_BASE}/favorites/${encodeURIComponent(upso_nm)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data; // { message: "즐겨찾기 삭제 완료" }
};

// 즐찾 서치
export const fetchFavorite = async (id) => {
  const response = await axios.get(`${API_BASE}/favorites_search`, {
    params: { id },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`
    }
  });
  return response.data; // [{ id, upso_nm }, ...]
};
