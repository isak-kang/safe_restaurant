// src/components/FavoriteButton.jsx
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { addFavorite, deleteFavorite, fetchFavorite } from "../api/api";

export default function FavoriteButton({ upso_nm }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const token = localStorage.getItem("access_token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchFavorite()
      .then((list) => {
        const favs = list.map((item) => item.upso_nm);
        setIsFavorited(favs.includes(upso_nm));
      })
      .catch(console.error);
  }, [upso_nm, isLoggedIn]);

  const handleClick = async (e) => {
    // 링크 클릭 이벤트 전파 차단
    e.preventDefault();
    e.stopPropagation();

    /*** 수정된 부분 시작 ***/
    if (!isLoggedIn) {
      // 확인창 띄우기
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 화면으로 이동하시겠습니까?");
      if (goLogin) {
        // OK 누르면 로그인 페이지로 이동
        window.location.href = "/login";
      }
      return;
    }
    /*** 수정된 부분 끝 ***/

    try {
      if (isFavorited) {
        await deleteFavorite(upso_nm);
      } else {
        await addFavorite(upso_nm);
      }
      setIsFavorited((prev) => !prev);
    } catch (err) {
      console.error("즐겨찾기 오류:", err);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "1.5rem",
        padding: 0,
      }}
      aria-label="즐겨찾기"
    >
      {isFavorited ? <FaHeart color="red" /> : <FaRegHeart />}
    </button>
  );
}
