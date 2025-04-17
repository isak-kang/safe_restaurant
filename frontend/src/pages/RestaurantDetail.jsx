import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { fetchRestaurantByName,fetchMapData } from "../api/api";
import KakaoMap from '../components/KakaoMap'; // KakaoMap 컴포넌트 import



export default function RestaurantDetail() {
  const { upso_nm } = useParams();
  const navigate = useNavigate();  // 뒤로가기용 hook
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurantByName(upso_nm)
      .then((data) => {
        setRestaurant(data);
        setError(null);
      })
      .catch(() => {
        setError("정보를 불러올 수 없습니다.");
      });
  }, [upso_nm]);

  const [coords, setCoords] = useState({ LAT: null, LNG: null });

  useEffect(() => {
    if (restaurant?.SITE_ADDR_RD) {
      fetchMapData(restaurant.SITE_ADDR_RD)
        .then((data) => setCoords(data))
        .catch(() => setCoords({ LAT: null, LNG: null }));
    }
  }, [restaurant]);

  if (error) return <div>{error}</div>;
  if (!restaurant) return <div>로딩 중...</div>;

  
  
  return (
    <div className="p-4">
      {/* 왼쪽 상단 뒤로가기 버튼 */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← 뒤로가기
      </button>

      <h2>{restaurant.UPSO_NM}</h2>
      <p><strong>주소:</strong> {restaurant.SITE_ADDR_RD}</p>
      <p><strong>업종:</strong> {restaurant.SNT_UPTAE_NM}</p>
      <p><strong>매장 크기:</strong> {restaurant.TRDP_AREA}</p>
      <p><strong>행정동:</strong> {restaurant.ADMDNG_NM}</p>
      <p><strong>지정일:</strong> {restaurant.ASGN_YMD}</p>

      {/* KakaoMap 컴포넌트 */}
      {coords.LAT && coords.LNG && (
        <div style={{ marginTop: '20px' }}>
          <KakaoMap latitude={coords.LAT} longitude={coords.LNG} upso={restaurant.UPSO_NM}/>
        </div>
      )}


    </div>
  );
}
