import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { fetchRestaurantByName, fetchMapData, fetchPhoto } from "../api/api";
import KakaoMap from '../components/KakaoMap';
import FavoriteButton from "../components/FavoriteButton";  // 추가

export default function RestaurantDetail() {
  const { upso_nm } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ LAT: null, LNG: null });
  const [photos, setPhotos] = useState([]);
  const [score, setScore] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 업소 정보
  useEffect(() => {
    fetchRestaurantByName(upso_nm)
      .then(data => setRestaurant(data))
      .catch(() => setError("정보를 불러올 수 없습니다."));
  }, [upso_nm]);

  // 좌표 변환
  useEffect(() => {
    if (restaurant?.SITE_ADDR_RD) {
      fetchMapData(restaurant.SITE_ADDR_RD)
        .then(data => setCoords(data))
        .catch(() => setCoords({ LAT: null, LNG: null }));
    }
  }, [restaurant]);

  // 사진 & 평점
  useEffect(() => {
    if (upso_nm) {
      fetchPhoto(upso_nm)
        .then(res => {
          if (res.data.length > 0) {
            setPhotos(res.data.map(item => item.img_url));
            setScore(res.data[0].score);
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

      {/* <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← 뒤로가기
      </button> */}

      <div><FavoriteButton upso_nm={restaurant.upso_nm} /></div>  {/* 즐겨찾기 버튼 */}
      <h2 className="me-2">{restaurant.upso_nm}</h2>
      

      <p><strong>주소:</strong> {restaurant.SITE_ADDR_RD}</p>
      <p><strong>업종:</strong> {restaurant.SNT_UPTAE_NM}</p>
      <p><strong>매장 크기:</strong> {restaurant.TRDP_AREA}</p>
      <p><strong>행정동:</strong> {restaurant.ADMDNG_NM}</p>
      <p><strong>지정일:</strong> {restaurant.ASGN_YMD}</p>

      {score && <p><strong>카카오평점:</strong> ⭐ {score}</p>}

      {coords.LAT && coords.LNG && (
        <div style={{ marginTop: '20px' }}>
          <KakaoMap
            latitude={coords.LAT}
            longitude={coords.LNG}
            upso={restaurant.upso_nm}
          />
        </div>
      )}
    {/* 매장 사진 */}
    
      {photos.length > 0 && (
        <div className="mt-4">
          <h4>매장 사진</h4>
          <div className="d-flex flex-wrap gap-3">
            {photos.map((url, idx) => (
              <img
                key={idx}
                src={url === "없음" ? "/img/no_img.png" : url}
                alt={`매장사진${idx}`}
                style={{ width: '20%', borderRadius: '5px', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedPhoto(url);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 사진 모달 */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <img
            src={selectedPhoto}
            alt="확대된 매장사진"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>

  );
}
