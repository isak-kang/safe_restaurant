// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import {
  getProtectedData,
  fetchRestaurants,
  fetchRestaurantsRecommendScore,
  fetchFilterOptions,
  fetchWeatherRecommend
} from "../api/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { Link } from "react-router-dom";
import FavoriteButton from "../components/FavoriteButton";

export default function Home() {
  const [user, setUser] = useState(null);
  const [byRegion, setByRegion] = useState([]);
  const [byScore, setByScore] = useState([]);
  const [byWeather, setByWeather] = useState([]);
  const [weatherMemo, setWeatherMemo] = useState("");
  const [weatherCondition, setWeatherCondition] = useState("");
  const [weatherMenu, setWeatherMenu] = useState([]);
  const [byType, setByType] = useState([]);
  const [uptaeOptions, setUptaeOptions] = useState([]);
  const [error, setError] = useState("");
  const [currentType, setCurrentType] = useState("");

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
      const isOther = user?.address === "그 외";
      let data = await fetchRestaurants(
        (!user || isOther) ? "" : user.address,
        "", ""
      );
      if ((data.length === 0 && user?.address && !isOther) || isOther) {
        data = await fetchRestaurants("", "", "");
      }
      setByRegion([...data].sort(() => 0.5 - Math.random()).slice(0, 4));
    } catch {
      setError("지역 기반 추천을 불러오는 중 오류가 발생했습니다.");
    }
  };
  useEffect(() => { loadByRegion(); }, [user]);
  const refreshByRegion = () => { loadByRegion(); };

  // 4) 평점 기반 추천
  const loadByScore = async () => {
    try {
      const data = await fetchRestaurantsRecommendScore();
      setByScore([...data].sort(() => 0.5 - Math.random()).slice(0, 4));
    } catch {
      setError("평점 기반 추천을 불러오는 중 오류가 발생했습니다.");
    }
  };
  useEffect(() => { loadByScore(); }, []);
  const refreshByScore = () => { loadByScore(); };

  // 5) 업태 랜덤 추천
  const pickRandomType = () =>
    uptaeOptions.length
      ? uptaeOptions[Math.floor(Math.random() * uptaeOptions.length)]
      : null;
  const loadByType = async () => {
    const type = pickRandomType();
    if (!type) return;
    setCurrentType(type);
    try {
      let data = await fetchRestaurants("", type, "");
      if (data.length === 0) data = await fetchRestaurants("", "", "");
      setByType([...data].sort(() => 0.5 - Math.random()).slice(0, 4));
    } catch {
      setError("업태 기반 추천을 불러오는 중 오류가 발생했습니다.");
    }
  };
  useEffect(() => { if (uptaeOptions.length) loadByType(); }, [uptaeOptions]);
  const refreshByType = () => { loadByType(); };

  // 6) 날씨 기반 추천
  const loadByWeather = async () => {
    try {
      const data = await fetchWeatherRecommend();
      setWeatherMemo(data.memo);
      setWeatherCondition(data.condition);
      setWeatherMenu(data.recommend);
      setByWeather([...data.restaurants].sort(() => 0.5 - Math.random()).slice(0, 4));
    } catch {
      setError("날씨 기반 추천을 불러오는 중 오류가 발생했습니다.");
    }
  };
  useEffect(() => { loadByWeather(); }, []);
  const refreshByWeather = () => { loadByWeather(); };

  return (
    <div className="container py-4">
      {/* — 헤더 메시지 — */}
      {user ? (
        <h2 className="text-center mb-3 d-flex justify-content-center gap-2">
          {user.address === '그 외' ? '서울 전체를 ' : user.address} 모범음식점 추천🍽️
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={refreshByRegion}
            title="추천 다시 받기"
          >
              <img src="/img/change_img.png" alt="필터링" className="filter-img" />

          </button>
        </h2>
      ) : (
        <>
          <h2 className="text-center mb-2">
            랜덤 모범음식점 추천
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={refreshByRegion}
              title="추천 다시 받기"
            >
              <img src="/img/change_img.png" alt="필터링" className="filter-img" />

            </button>
          </h2>
          <p className="text-center">
            <Link to="/login">로그인</Link> 하시면 지역 기반 추천을 받아볼 수 있어요.
          </p>
        </>
      )}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* — 지역 기반 추천 섹션 — */}
      <section className="row gx-3 gy-4 justify-content-center mb-5">
        {byRegion.map(r => (
          <div className="col-6 col-md-3" key={r.upso_nm}>
            <Link to={`/restaurant/${encodeURIComponent(r.upso_nm)}`} target="_blank" style={{ textDecoration: "none" }}>
              <div className="card shadow-sm rounded-4 h-100 position-relative">
                <div style={{ position: "absolute", top: 4, right: 4, zIndex:10 }}>
                  <FavoriteButton upso_nm={r.upso_nm} />
                </div>
                <img src={r.img_url||"/img/no_img.png"} alt={r.upso_nm}
                     className="card-img-top rounded-top-4"
                     style={{ height:180, objectFit:"cover" }} />
                <div className="card-body text-center p-2">
                  <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                  <div><small className="text-muted">{r.addr}</small></div>
                  <small className="text-muted">{r.MAIN_EDF}</small>
                  <div><small className="text-muted">{r.ASGN_YMD}</small></div>
                  <div><small className="text-muted">⭐ {r.score}</small></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </section>

      {/* — 평점 기반 추천 섹션 — */}
      <section className="row gx-3 gy-4 justify-content-center mb-5">
        <h2 className="text-center w-100 mb-3 d-flex justify-content-center gap-2">
          평점 4.0 이상 추천 🌟
          <button className="btn btn-sm btn-outline-secondary" onClick={refreshByScore}>
              <img src="/img/change_img.png" alt="필터링" className="filter-img" />

          </button>
        </h2>
        {byScore.map(r => (
          <div className="col-6 col-md-3" key={r.upso_nm}>
            <Link to={`/restaurant/${encodeURIComponent(r.upso_nm)}`} target="_blank" style={{ textDecoration: "none" }}>
              <div className="card shadow-sm rounded-4 h-100 position-relative">
                <div style={{ position: "absolute", top: 4, right: 4, zIndex:10 }}>
                  <FavoriteButton upso_nm={r.upso_nm} />
                </div>
                <img src={r.img_url||"/img/no_img.png"} alt={r.upso_nm}
                     className="card-img-top rounded-top-4"
                     style={{ height:180, objectFit:"cover" }} />
                <div className="card-body text-center p-2">
                  <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                  <div><small className="text-muted">{r.addr}</small></div>
                  <small className="text-muted">{r.MAIN_EDF}</small>
                  <div><small className="text-muted">{r.ASGN_YMD}</small></div>
                  <div><small className="text-muted">⭐ {r.score}</small></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </section>

      {/* — 날씨 기반 추천 섹션 — */}
      <section className="row gx-3 gy-4 justify-content-center mb-5">
        <h2 className="text-center w-100 mb-3 d-flex justify-content-center gap-2">
          날씨 기반 추천 🌤️
          <button className="btn btn-sm btn-outline-secondary" onClick={refreshByWeather}>
              <img src="/img/change_img.png" alt="필터링" className="filter-img" />

          </button>
        </h2>
        <p className="text-center text-muted w-100">지금 날씨는 <strong>{weatherCondition}</strong>!</p>
        <p className="text-center text-muted w-100">
  💡      {weatherMemo} 
          {/* (메뉴: {weatherMenu.join(", ")}) */}
        </p>
        {byWeather.map(r => (
          <div className="col-6 col-md-3" key={r.upso_nm}>
            <Link to={`/restaurant/${encodeURIComponent(r.upso_nm)}`} target="_blank" style={{ textDecoration: "none" }}>
              <div className="card shadow-sm rounded-4 h-100 position-relative">
                <div style={{ position: "absolute", top: 4, right: 4, zIndex:10 }}>
                  <FavoriteButton upso_nm={r.upso_nm} />
                </div>
                <img src={r.img_url||"/img/no_img.png"} alt={r.upso_nm}
                     className="card-img-top rounded-top-4"
                     style={{ height:180, objectFit:"cover" }} />
                <div className="card-body text-center p-2">
                  <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                  <div><small className="text-muted">{r.addr}</small></div>
                  <small className="text-muted">{r.MAIN_EDF}</small>
                  <div><small className="text-muted">{r.ASGN_YMD}</small></div>

                  <div><small className="text-muted">⭐ {r.score}</small></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </section>

      {/* — 업태 랜덤 추천 섹션 — */}
      <section className="row gx-3 gy-4 justify-content-center mb-5">
        <h2 className="text-center w-100 mb-3 d-flex justify-content-center gap-2">
          {currentType || "…"} 추천 🎲
          <button className="btn btn-sm btn-outline-secondary" onClick={refreshByType}>
              <img src="/img/change_img.png" alt="필터링" className="filter-img" />

          </button>
        </h2>
        {byType.map(r => (
          <div className="col-6 col-md-3" key={r.upso_nm}>
            <Link to={`/restaurant/${encodeURIComponent(r.upso_nm)}`} target="_blank" style={{ textDecoration: "none" }}>
              <div className="card shadow-sm rounded-4 h-100 position-relative">
                <div style={{ position: "absolute", top: 4, right: 4, zIndex:10 }}>
                  <FavoriteButton upso_nm={r.upso_nm} />
                </div>
                <img src={r.img_url||"/img/no_img.png"} alt={r.upso_nm}
                     className="card-img-top rounded-top-4"
                     style={{ height:180, objectFit:"cover" }} />
                <div className="card-body text-center p-2">
                  <h5 className="card-title fs-6 mb-0">{r.upso_nm}</h5>
                  <div><small className="text-muted">{r.addr}</small></div>
                  <small className="text-muted">{r.MAIN_EDF}</small>
                  <div><small className="text-muted">{r.ASGN_YMD}</small></div>
                  <div><small className="text-muted">⭐ {r.score}</small></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
