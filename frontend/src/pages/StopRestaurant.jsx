import { useEffect, useState, useCallback } from "react";
import { fetchStopRestaurant } from "../api/api";
import InfiniteScrollTrigger from "../components/InfiniteScrollTrigger";
import { Link } from "react-router-dom";
export default function StopRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchStopRestaurant();
        setRestaurants(data);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (visibleCount < restaurants.length) {
      setVisibleCount((prev) => prev + 5);
    }
  }, [visibleCount, restaurants.length]);

  if (loading) return <div>로딩 중...</div>;
  if (!restaurants.length) return <div>결과가 없습니다.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📛 영업정지 / 위반 업소 리스트</h2>
      
      {restaurants.slice(0, visibleCount).map((row, idx) => (
        <div
          key={idx}
          className="card mb-3 card-hover"
          style={{
            cursor: "default",
            display: "flex",
            flexDirection: "row",
            height: "auto",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Link
            to={`/stoprestaurant/${encodeURIComponent(row.UPSO_NM)}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card-body" style={{ flex: "1", padding: "1rem" }}>
              <h5 className="card-title mb-2" style={{ fontWeight: "600" }}>
                {row.UPSO_NM}
              </h5>
              <p className="card-text mb-1" style={{ fontSize: "0.95rem" }}>
                📍 <strong>주소:</strong> {row.SITE_ADDR_RD || row.SITE_ADDR}
              </p>
              <p className="card-text mb-1">
                <strong>업종:</strong> {row.SNT_UPTAE_NM}
              </p>
              <p className="card-text mb-1">
                <strong>위반 일자:</strong> {row.VIOR_YMD || "미제공"}
              </p>
              <p className="card-text mb-1">
                <strong>위반 내용:</strong> {row.VIOL_CN || "없음"}
              </p>
              <p className="card-text mb-1">
                <strong>조치 내용:</strong> {row.DISPO_CTN || "없음"}
              </p>
              <p className="card-text mb-1">
                <strong>조치 기간:</strong> {row.DISPO_GIGAN || "없음"}
              </p>
              <p className="card-text mb-0 text-muted">
                <small>행정처분일: {row.ADM_DISPO_YMD || "미제공"}</small>
              </p>
            </div>
          </Link>
        </div>
      ))}

      {/* 🔽 스크롤 트리거 컴포넌트 */}
      <InfiniteScrollTrigger
        onIntersect={handleLoadMore}
        hasMore={visibleCount < restaurants.length}
      />

      {/* ✅ 모든 데이터 로딩 완료 메시지 */}
      {visibleCount >= restaurants.length && (
        <div className="text-center text-muted mt-4">
          모든 업소를 불러왔습니다.
        </div>
      )}
    </div>
  );
}
