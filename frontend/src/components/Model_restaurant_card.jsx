import React from "react";
import { Link } from "react-router-dom";

function ModelRestaurantCard({ row }) {
  const imageUrl = row.img_url || "/placeholder.jpg";

  return (
    <Link
      to={`/restaurant/${encodeURIComponent(row.UPSO_NM)}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="card mb-3 card-hover" style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flex: "0 0 150px" }}>
          <img
            src={imageUrl}
            alt={row.UPSO_NM}
            style={{ width: "150px", height: "100%", objectFit: "cover", borderRadius: "4px 0 0 4px" }}
          />
        </div>
        <div className="card-body">
          <h5 className="card-title mb-1">{row.UPSO_NM}</h5>
          <p className="mb-1"><strong>주소:</strong> {row.addr}</p>
          <p className="mb-1"><strong>업태:</strong> {row.SNT_UPTAE_NM} / {row.MAIN_EDF}</p>
        </div>
      </div>
    </Link>
  );
}

export default ModelRestaurantCard;
