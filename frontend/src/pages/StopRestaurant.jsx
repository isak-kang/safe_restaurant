import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams }  from "react-router-dom";
import InfiniteScrollTrigger      from "../components/InfiniteScrollTrigger";
import { fetchStopRestaurant }    from "../api/api";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function StopRestaurant() {
  const [restaurants, setRestaurants]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm]     = useState(searchParams.get("name") || "");
  const [selectedGu, setSelectedGu]     = useState(searchParams.get("gu")   || "");
  const [filterOpen, setFilterOpen]     = useState(false);
  const [appliedYearStart, setAppliedYearStart] = useState(2015);
  const [appliedYearEnd, setAppliedYearEnd] = useState(2025);
  const filterRef                       = useRef(null);

  const guOptions = [
    "강남구","강동구","강북구","강서구","관악구","광진구",
    "구로구","금천구","노원구","도봉구","동대문구","동작구",
    "마포구","서대문구","서초구","성동구","성북구","송파구",
    "양천구","영등포구","용산구","은평구","종로구","중구","중랑구"
  ];

  useEffect(() => {
    fetchStopRestaurant()
      .then(data => setRestaurants(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredRestaurants = restaurants.filter(r => {
    const matchName = r.upso_nm?.includes(searchTerm);
    const matchGu   = !selectedGu || r.SITE_ADDR?.includes(selectedGu) || r.SITE_ADDR_RD?.includes(selectedGu);
    const dispoYear = r.ADM_DISPO_YMD?.slice(0, 4);
    const matchYear = dispoYear >= appliedYearStart && dispoYear <= appliedYearEnd;
    return matchName && matchGu && matchYear;
  });

  const currentItems = filteredRestaurants.slice(0, visibleCount);
  const hasMore      = visibleCount < filteredRestaurants.length;

  const handleLoadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount(v => v + 5);
  }, [hasMore]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      const p = {};
      if (searchTerm) p.name = searchTerm;
      if (selectedGu) p.gu   = selectedGu;
      setSearchParams(p);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedGu, setSearchParams]);

  useEffect(() => {
    const onClick = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (loading) return <div>데이터가 방대해서 불러오는데 시간이 5~10초 정도 걸립니다ㅠㅠ 잠시만 기다려주세요</div>;
  if (!restaurants.length) return <div>결과가 없습니다.</div>;

  return (
    <div className="container mt-4">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <input
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="예: 한우"
          style={{ width: '50vw' }}
        />
      </div>

      <h2 className="mb-4 d-flex justify-content-between align-items-center">
        <span className="mx-auto">영업정지 업소 리스트</span>
        <button
          className="btn btn-primary btn-sm w-auto" style={{backgroundColor:'#E0F2F1'}}
          onClick={() => setFilterOpen(o => !o)}
        >
          <img
            src="/img/filtering_img.png"
            alt="필터링"
            className="filter-img"
          />
        </button>
      </h2>

      <div className={`filter-panel ${filterOpen ? "open" : ""}`} ref={filterRef}>
        <div className="filter-header position-relative mb-3">
          <button className="close-btn" onClick={() => setFilterOpen(false)}>
            &times;
          </button>
          <h4 className="text-center m-0">필터</h4>
        </div>
        <div className="p-3">
          <div className="filter-section mb-3">
            <label className="fw-bold mb-2">구 선택</label>
            <div className="btn-group flex-wrap">
              <button
                className={`btn btn-outline-primary m-1 ${!selectedGu ? "active" : ""}`}
                onClick={() => setSelectedGu("")}
              >전체</button>
              {guOptions.map(gu => (
                <button
                  key={gu}
                  className={`btn btn-outline-primary m-1 ${selectedGu === gu ? "active" : ""}`}
                  onClick={() => setSelectedGu(gu)}
                >{gu}</button>
              ))}
            </div>
          </div>

          <div className="filter-section mb-3">
            <label className="fw-bold mb-2">📅 처분 연도</label>
            <div className="px-2">
              <Slider
                range
                min={2015}
                max={2025}
                allowCross={false}
                value={[appliedYearStart, appliedYearEnd]}
                onChange={([start, end]) => {
                  setAppliedYearStart(start);
                  setAppliedYearEnd(end);
                }}
              />
              <div className="d-flex justify-content-between mt-2">
                <small>{appliedYearStart}년</small>
                <small>{appliedYearEnd}년</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        {currentItems.map((row, idx) => (
          <div
            key={idx}
            className="card mb-3 card-hover"
            style={{ display: "flex", flexDirection: "row", width: "100%", maxWidth: "800px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "10px", overflow: "hidden" }}
          >
            <Link
              to={`/stoprestaurant/${encodeURIComponent(row.upso_nm)}`}
              target="_blank"
              style={{ textDecoration: "none", color: "inherit", width: "100%" }}
            >
              <div className="card-body" style={{ padding: "1rem" }}>
                <h5 style={{ fontWeight: 600 }}>{row.upso_nm}</h5>
                <p> {row.SITE_ADDR_RD || row.SITE_ADDR}</p>
                <p>업종: {row.SNT_UPTAE_NM}</p>
                <p>위반일자: {row.VIOR_YMD || "미제공"}</p>
                <p>처분일자: {row.ADM_DISPO_YMD || "미제공"}</p>
                <p>처분내용: {row.VIOL_CN || "없음"}</p>
              </div>
            </Link>
          </div>
        ))}

        {hasMore && (
          <InfiniteScrollTrigger onIntersect={handleLoadMore} hasMore={hasMore} />
        )}

        {!hasMore && (
          <div className="text-center text-muted mt-4">
            모든 업소를 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}
