import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { fetchRestaurantByName, fetchMapData, fetchPhoto } from "../api/api";
import KakaoMap from '../components/KakaoMap';

export default function RestaurantDetail() {
  const { upso_nm } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ LAT: null, LNG: null });

  const [photos, setPhotos] = useState([]);         // 사진 리스트
  const [score, setScore] = useState(null);         // score (한 번만)

  // 업소 정보 불러오기
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

  // 주소 → 좌표 변환
  useEffect(() => {
    if (restaurant?.SITE_ADDR_RD) {
      fetchMapData(restaurant.SITE_ADDR_RD)
        .then((data) => setCoords(data))
        .catch(() => setCoords({ LAT: null, LNG: null }));
    }
  }, [restaurant]);

  // 사진 + 평점 불러오기
  useEffect(() => {
    if (upso_nm) {
      fetchPhoto(upso_nm)
        .then((res) => {
          if (res.data.length > 0) {
            setPhotos(res.data.map(item => item.img_url));      // 이미지 배열 저장
            setScore(res.data[0].score);                        // 첫 score만 사용
          }
        })
        .catch(() => {
          setPhotos([]);
          setScore(null);
        });
    }
  }, [upso_nm]);

  if (error) return <div>{error}</div>;
  if (!restaurant) return <div>로딩 중...</div>;

  return (
    <div className="p-4">
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

      {score && (
        <p><strong>카카오평점:</strong> ⭐ {score}</p>
      )}

      {coords.LAT && coords.LNG && (
        <div style={{ marginTop: '20px' }}>
          <KakaoMap latitude={coords.LAT} longitude={coords.LNG} upso={restaurant.UPSO_NM} />
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-4">
          <h4>매장 사진</h4>
          <div className="d-flex flex-wrap gap-3">
            {photos.map((url, idx) => (
              <img key={idx} src={url} alt={`매장사진${idx}`} style={{ width: '200px', borderRadius: '10px' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
