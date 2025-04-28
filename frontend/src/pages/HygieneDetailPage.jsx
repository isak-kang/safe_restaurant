import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStopRestaurantByName } from "../api/api";
import 'bootstrap/dist/css/bootstrap.min.css';

function HygieneDetailPage() {
  const { upso_nm } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const COLUMN_LABELS = {
    CGG_CODE: "자치구 코드",
    ADM_DISPO_YMD: "행정처분일",
    GNT_NO: "영업허가번호",
    SNT_COB_NM: "업소 구분",
    SNT_UPTAE_NM: "업종",
    upso_nm: "업소명",
    SITE_ADDR_RD: "도로명 주소",
    SITE_ADDR: "지번 주소",
    DRT_INSP_YMD: "직전 점검일",
    ADMM_STATE: "처분 상태",
    DISPO_CTN: "조치 내용",
    BAS_LAW: "위반 법령",
    VIOR_YMD: "위반 일자",
    VIOL_CN: "위반 내용",
    DISPO_CTN_DT: "조치 내용(날짜 포함)",
    DISPO_GIGAN: "조치 기간",
    TRDP_AREA: "거래 지역",
    x: "위도",
    y: "경도"
  };

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchStopRestaurantByName(upso_nm);
        if (!data || data.length === 0) {
          setError("해당 업소 정보를 찾을 수 없습니다.");
        } else {
          setRestaurants(data);
        }
      } catch (err) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };
    loadDetail();
  }, [upso_nm]);

  if (error) {
    return <div className="alert alert-danger text-center mt-4">{error}</div>;
  }

  if (!restaurants || restaurants.length === 0) {
    return <div className="text-center mt-4">불러오는 중...</div>;
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">🧼 위생 행정처분 상세 정보</h2>
      {/* <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← 뒤로가기
      </button> */}
      {restaurants.map((restaurant, index) => (
        <div key={index} className="mb-5">
          <h5 className="mb-3">📌 [{index + 1}] {restaurant["upso_nm"] || upso_nm}</h5>
          <table className="table table-bordered">
            <tbody>
              {Object.entries(restaurant).map(([key, value]) => (
                <tr key={key}>
                  <th className="text-nowrap text-end" style={{ width: "30%" }}>
                    {COLUMN_LABELS[key] || key}
                  </th>
                  <td>{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default HygieneDetailPage;
