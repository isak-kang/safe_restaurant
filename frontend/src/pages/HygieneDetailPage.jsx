import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchStopRestaurantByName } from "../api/api";
import 'bootstrap/dist/css/bootstrap.min.css';

function HygieneDetailPage() {
  const { upso_nm } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchStopRestaurantByName(upso_nm);

        if (!data || data.length === 0) {
          setError("해당 업소 정보를 찾을 수 없습니다.");
        } else {
          setRestaurants(data); // 배열 전체 저장
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

      {restaurants.map((restaurant, index) => (
        <div key={index} className="mb-5">
          <h5 className="mb-3">📌 [{index + 1}] {restaurant["업소명"] || upso_nm}</h5>
          <table className="table table-bordered">
            <tbody>
              {Object.entries(restaurant).map(([key, value]) => (
                <tr key={key}>
                  <th className="text-nowrap text-end" style={{ width: "30%" }}>{key}</th>
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
