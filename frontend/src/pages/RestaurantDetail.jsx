import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRestaurantByName } from "../api/api";

export default function RestaurantDetail() {
  const { upso_nm } = useParams();
  const navigate = useNavigate();  // 👈 뒤로가기용 hook
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

  if (error) return <div>{error}</div>;
  if (!restaurant) return <div>로딩 중...</div>;

  return (
    <div className="p-4">
      {/* 👇 왼쪽 상단 뒤로가기 버튼 */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← 뒤로가기
      </button>

      <h2>{restaurant.UPSO_NM}</h2>
      <p><strong>주소:</strong> {restaurant.SITE_ADDR_RD}</p>
      <p><strong>업종:</strong> {restaurant.SNT_UPTAE_NM}</p>
      <p><strong>지역:</strong> {restaurant.TRDP_AREA}</p>
      <p><strong>행정동:</strong> {restaurant.ADMDNG_NM}</p>
      <p><strong>지정일:</strong> {restaurant.ASGN_YMD}</p>
    </div>
  );
}
