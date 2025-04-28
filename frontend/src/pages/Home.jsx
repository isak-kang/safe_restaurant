import React, { useEffect, useState } from "react";
import {
  getProtectedData,
  fetchRestaurants,
  fetchRestaurantsRecommendScore,
  fetchFilterOptions
} from "../api/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { Link } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const [byRegion, setByRegion] = useState([]);
  const [byScore, setByScore] = useState([]);
  const [byType, setByType] = useState([]);
  const [uptaeOptions, setUptaeOptions] = useState([]);
  const [error, setError] = useState("");
  const [currentType, setCurrentType] = useState(""); // 뽑힌 업태 저장

  // 1) 로그인 사용자 정보
  useEffect(() => {
    getProtectedData()
      .then(res => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  // 2) 업태 옵션
  useEffect(() => {
    fetchFilterOptions()
      .then(res => setUptaeOptions(res.uptaeOptions))
      .catch(() => {});
  }, []);

  // 3) 지역 기반 추천
  const loadByRegion = async () => {
    try {
      // "그 외"일 땐 전체 조회
      const isOther = user?.address === "그 외";
      let data = await fetchRestaurants(
        (!user || isOther) ? "" : user.address,
        "",
        ""
      );
      // 해당 구 조회했는데 결과가 없으면 전체로 다시 조회
      if ((data.length === 0 && user?.address && !isOther) || isOther) {
        data = await fetchRestaurants("", "", "");
      }
      const sample = [...data].sort(() => 0.5 - Math.random()).slice(0, 4);
      setByRegion(sample);
    } catch {
      setError("지역 기반 추천을 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadByRegion();
  }, [user]);

  const refreshByRegion = () => {
    loadByRegion();
  };

  // 4) 평점 기반 추천
  const loadByScore = async () => {
    try {
      const data = await fetchRestaurantsRecommendScore();
      const sample = [...data].sort(() => 0.5 - Math.random()).slice(0, 4);
      setByScore(sample);
    } catch {
      setError("평점 기반 추천을 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadByScore();
  }, []);

  const refreshByScore = () => {
    loadByScore();
  };

  // 5) 업태 랜덤 추천
  const pickRandomType = () => {
    return uptaeOptions.length
      ? uptaeOptions[Math.floor(Math.random() * uptaeOptions.length)]
      : null;
  };

  const loadByType = async () => {
    const type = pickRandomType();
    if (!type) return;
    setCurrentType(type);
    try {
      let data = await fetchRestaurants("", type, "");
      // 조회 결과가 없으면 전체로 fallback
      if (data.length === 0) {
        data = await fetchRestaurants("", "", "");
      }
      const sample = [...data].sort(() => 0.5 - Math.random()).slice(0, 4);
      setByType(sample);
    } catch {
      setError("업태 기반 추천을 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (uptaeOptions.length) loadByType();
  }, [uptaeOptions]);

  const refreshByType = () => {
    loadByType();
  };

  return (
    <div className="container py-4">
      {/* 지역 기반 */}
      <h2 className="text-center mb-3 d-flex justify-content-center gap-2">
        추천 모범음식점 🍽️
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={refreshByRegion}
          title="추천 다시 받기"
        >
          🔄
        </button>
      </h2>
      {user ? (
        <p className="text-center mb-3">
          <strong>
            {/* user.address가 "그 외"면 "전체"로, 아니면 원래 주소로 */}
            {user.address === '그 외' ? '서울 전체를 ' : user.address}
          </strong>
          기준으로 추천드려요!
        </p>
      ) : (
        <p className="text-center text-muted mb-3">
          <Link to="/login">로그인</Link> 하시면 지역 기반 추천을 받아볼 수 있어요.
        </p>
      )}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      <div className="row gx-3 gy-4 justify-content-center mb-5">
        {byRegion.map((r, i) => (
          <div className="col-6 col-md-3" key={i}>
            <Link
              to={`/restaurant/${encodeURIComponent(r.upso_nm)}`}
              target="_blank"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card shadow-sm rounded-4 h-100">
                <img
                  src={r.img_url || "/img/no_img.png"}
                  alt={r.upso_nm}
                  className="card-img-top rounded-top-4"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body text-center p-2">
                  <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                  <div><small className="text-muted">{r.addr}</small></div>
                  <small className="text-muted">{r.SNT_UPTAE_NM}</small>
                  <div><small className="text-muted">⭐ {r.score}</small></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 평점 기반 */}
      <h2 className="text-center mb-3 d-flex justify-content-center gap-2">
        평점 4.0 이상 추천 🌟
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={refreshByScore}
          title="다시 받기"
        >
          🔄
        </button>
      </h2>
      <div className="row gx-3 gy-4 justify-content-center mb-5">
        {byScore.map((r, i) => (
          <div className="col-6 col-md-3" key={i}>
            <Link
              to={`/restaurant/${encodeURIComponent(r.upso_nm)}`}
              target="_blank"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card shadow-sm rounded-4 h-100">
                <img
                  src={r.img_url || "/img/no_img.png"}
                  alt={r.upso_nm}
                  className="card-img-top rounded-top-4"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body text-center p-2">
                  <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                  <div><small className="text-muted">{r.addr}</small></div>
                  <small className="text-muted">{r.SNT_UPTAE_NM}</small>
                  <div><small className="text-muted">⭐ {r.score}</small></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 업태 랜덤 기반 */}
      <h2 className="text-center mb-3 d-flex justify-content-center gap-2">
      {currentType || "…"} 추천 🎲
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={refreshByType}
          title="업태 추천 다시 받기"
        >
          🔄
        </button>
      </h2>
      <div className="row gx-3 gy-4 justify-content-center">
        {byType.map((r, i) => (
          <div className="col-6 col-md-3" key={i}>
            <Link
              to={`/restaurant/${encodeURIComponent(r.upso_nm)}`}
              target="_blank"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card shadow-sm rounded-4 h-100">
                <img
                  src={r.img_url || "/img/no_img.png"}
                  alt={r.upso_nm}
                  className="card-img-top rounded-top-4"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body text-center p-2">
                  <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                  <div><small className="text-muted">{r.addr}</small></div>
                  <small className="text-muted">{r.SNT_UPTAE_NM}</small>
                  <div><small className="text-muted">⭐ {r.score}</small></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
