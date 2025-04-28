import React, { useEffect, useState, useCallback } from "react";
import InfiniteScrollTrigger from "../components/InfiniteScrollTrigger";
import ModelRestaurantCard from "../components/Model_restaurant_card";
import { getProtectedData, fetchFavorite } from "../api/api";
import { Link } from "react-router-dom";

export default function Favorite() {
  // 1) 로그인 여부(state)  
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  // 2) 무한 스크롤 핸들러
  const handleLoadMore = useCallback(() => {
    if (visibleCount < restaurants.length) {
      setVisibleCount(prev => prev + 5);
    }
  }, [visibleCount, restaurants.length]);

  // 3) 처음 마운트 시 로그인 확인 & 즐겨찾기 로드
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    // protected API 호출
    getProtectedData()
      .then(data => {
        const userId = data.user.id;
        return fetchFavorite(userId);
      })
      .then(favorites => setRestaurants(favorites))
      .catch(err => {
        console.error("즐겨찾기 조회 실패:", err);
        setIsLoggedIn(false);  // 토큰 만료 등
      });
  }, []);

  // 4) 로그인 안 된 경우
  if (!isLoggedIn) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning text-center">
          <Link to="/login">로그인</Link>
          이 필요합니다.
        </div>
      </div>
    );
  }

  // 5) 즐겨찾기 리스트 렌더링
  const currentItems = restaurants.slice(0, visibleCount);
  const hasMore = visibleCount < restaurants.length;

  return (
    <div className="container py-4">
      {restaurants.length === 0 ? (
        <div className="alert alert-warning mt-4 text-center">
          즐겨찾기가 없습니다.
        </div>
      ) : (
        <>
          {currentItems.map((row, idx) => (
            <ModelRestaurantCard key={row.id || idx} row={row} />
          ))}
          {hasMore && (
            <InfiniteScrollTrigger onIntersect={handleLoadMore} hasMore={hasMore} />
          )}
        </>
      )}
    </div>
  );
}
