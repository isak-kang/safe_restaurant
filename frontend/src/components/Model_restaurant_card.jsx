import React from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

function ModelRestaurantCard({ row }) {
  
  return (
      <Link
        to={`/restaurant/${encodeURIComponent(row.upso_nm)}`}
        target="_blank"
        style={{ textDecoration: "none", color: "inherit" }
      }
      >
      <div
        className="card mb-3 card-hover"
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
      >
        {/* 왼쪽 이미지 (30%) */}
        <div style={{ flex: "0 0 25%" }}>
          <img
            src={row.img_url === "없음" ? "/img/no_img.png" : row.img_url}
            alt={row.upso_nm}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "4px 0 0 4px",
            }}
          />
        </div>

        {/* 오른쪽 본문 (70%) */}
        <div
          className="card-body d-flex flex-column"
          style={{ flex: "1", padding: "15px", position: "relative" }}
        >
        <div
          style={{
            position: "absolute",
            top: "4px",               // 카드 내부 상단에서 8px
            right: "4px",             // 카드 내부 우측에서 8px
            zIndex: 10
          }}
        >
          <FavoriteButton upso_nm={row.upso_nm} />
        </div>

          {/* 나머지 정보 */}
          <h5
            className="card-title mb-0"
            style={{ fontSize: "1.1rem", fontWeight: "bold" }}
          >
            {row.upso_nm}
          </h5>
          <p className="mb-1" style={{ fontSize: "0.9rem" }}>
            <strong>주소:</strong> {row.addr}
          </p>
          <p className="mb-1" style={{ fontSize: "0.9rem" }}>
            <strong>업종:</strong> {row.SNT_UPTAE_NM}
          </p>
          <p className="mb-1" style={{ fontSize: "0.9rem" }}>
            <strong>주메뉴:</strong> {row.MAIN_EDF}
          </p>
          <p className="mb-1" style={{ fontSize: "0.9rem" }}>
            <strong>⭐ </strong> {row.score}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ModelRestaurantCard;
