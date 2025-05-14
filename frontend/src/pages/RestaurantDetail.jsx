import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { fetchRestaurantByName, fetchMapData, fetchPhoto,fetchSimilarRestaurant } from "../api/api";
import KakaoMap from '../components/KakaoMap';
import FavoriteButton from "../components/FavoriteButton";  // 추가
import { Link } from 'react-router-dom';
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
  const [similarRestaurants, setSimilarRestaurants] = useState([]);

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

  useEffect(() => {
    if (upso_nm) {
      fetchSimilarRestaurant(upso_nm)
        .then(setSimilarRestaurants)
        .catch(() => setSimilarRestaurants([]));
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
      {photos.length > 0 && (
        <div className="mt-4">
          <h4 className="text-center">매장 사진</h4>

          {/* 사진틀 - 가운데 정렬, 가로 50% */}
          <div
            style={{
              width: '100%',
              margin: '0 auto', // 가운데 정렬
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              backgroundColor: '#f8f8f8',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #ccc'
            }}
          >
            {photos.map((url, idx) => (
              <img
                key={idx}
                src={url === "없음" ? "/img/no_img.png" : url}
                alt={`매장사진${idx}`}
                style={{
                  width: '25%',
                  height: '25%',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedPhoto(url);
                  setIsModalOpen(true);
                }}
              />
            ))}
          
          </div>
          <div>            
          {similarRestaurants.length > 0 && (
  <div className="mt-5">
    <h4 className="text-center mb-4">유사한 매장 추천</h4>

    <div className="row gx-3 gy-4 justify-content-center">
      {similarRestaurants.map((r, i) => (
        <div className="col-6 col-md-3" key={i}>
          <Link
            to={`/restaurant/${encodeURIComponent(r.upso_nm)}`}
            target="_blank"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card shadow-sm rounded-4 h-100 position-relative">
              <img
                src={r.img_url || "/img/no_img.png"}
                alt={r.upso_nm}
                className="card-img-top rounded-top-4"
                style={{ height: "180px", objectFit: "cover" }}
              />
              <div className="card-body text-center p-2">
                <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                <div>
                  <small className="text-muted">{r.SITE_ADDR_RD}</small>
                </div>
                <small className="text-muted">{r.MAIN_EDF}</small>
                {r.score && (
                  <div>
                    <small className="text-muted">⭐ {r.score}</small>
                  </div>
                )}
                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                  유사도 등급: {r.rank_score}
                </p>

              </div>
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  zIndex: 10
                }}
              >
                <FavoriteButton upso_nm={r.upso_nm} />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  </div>
)}

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
