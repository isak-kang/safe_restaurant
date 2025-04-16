import React from "react";
import { Link } from "react-router-dom";

function ModelRestaurantCard({ row }) {
  return (
    <Link to={`/restaurant/${encodeURIComponent(row.UPSO_NM)}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card mb-3 card-hover" style={{ cursor: "pointer" }}>
        <div className="card-body">
          <h5 className="card-title">{row.UPSO_NM}</h5>
          <p className="card-text">{row.SITE_ADDR_RD}</p>
          <p className="card-text">
            <small className="text-muted">{row.SNT_UPTAE_NM}</small>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ModelRestaurantCard;
