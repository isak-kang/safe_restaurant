import React from "react";
import { Card } from "react-bootstrap";

const ModelRestaurantCard = ({ row }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{row.UPSO_NM}</Card.Title>
        <Card.Text>
          <strong>주소:</strong> {row.SITE_ADDR_RD}<br />
          <strong>구:</strong> {row.addr}<br />
          <strong>행정동 코드:</strong> {row.CGG_CODE}<br />
          <strong>지정일:</strong> {row.ASGN_YMD} ({row.ASGN_YY})<br />
          <strong>업종:</strong> {row.SNT_UPTAE_NM}<br />
          <strong>가계 넓이:</strong> {row.TRDP_AREA}<br />
          <strong>행정동:</strong> {row.ADMDNG_NM}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ModelRestaurantCard;
