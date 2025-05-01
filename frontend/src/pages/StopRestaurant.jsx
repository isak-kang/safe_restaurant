import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams }  from "react-router-dom";
import InfiniteScrollTrigger      from "../components/InfiniteScrollTrigger";
import { fetchStopRestaurant }    from "../api/api";

export default function StopRestaurant() {
  const [restaurants, setRestaurants]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm]     = useState(searchParams.get("name") || "");
  const [selectedGu, setSelectedGu]     = useState(searchParams.get("gu")   || "");
  const [filterOpen, setFilterOpen]     = useState(false);
  const filterRef                       = useRef(null);

  const guOptions = [
    "강남구","강동구","강북구","강서구","관악구","광진구",
    "구로구","금천구","노원구","도봉구","동대문구","동작구",
    "마포구","서대문구","서초구","성동구","성북구","송파구",
    "양천구","영등포구","용산구","은평구","종로구","중구","중랑구"
  ];

  // 1) 데이터 로드
  useEffect(() => {
    fetchStopRestaurant()
      .then(data => setRestaurants(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2) 필터링
  const filteredRestaurants = restaurants.filter(r => {
    const matchName = r.upso_nm?.includes(searchTerm);
    const matchGu   = !selectedGu || r.SITE_ADDR?.includes(selectedGu) || r.SITE_ADDR_RD?.includes(selectedGu);
    return matchName && matchGu;
  });

  // 3) derive currentItems + hasMore
  const currentItems = filteredRestaurants.slice(0, visibleCount);
  const hasMore      = visibleCount < filteredRestaurants.length;

  // 4) infinite‐scroll callback
  const handleLoadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount(v => v + 5);
  }, [hasMore]);

  // 5) URL sync for name/gu
  useEffect(() => {
    const debounce = setTimeout(() => {
      const p = {};
      if (searchTerm) p.name = searchTerm;
      if (selectedGu) p.gu   = selectedGu;
      setSearchParams(p);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedGu, setSearchParams]);

  // 6) close filter on outside click
  useEffect(() => {
    const onClick = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (loading) return <div>로딩 중…</div>;
  if (!restaurants.length) return <div>결과가 없습니다.</div>;

  return (
    <div className="container mt-4">
      {/* 검색창 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <input
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="예: 한우"
          style={{ width: '50vw' }}
        />
      </div>


      {/* 헤더 + 필터 토글 */}
      <h2 className="mb-4 d-flex justify-content-between align-items-center">
        <span className="mx-auto">📋 📛 영업정지 업소 리스트</span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setFilterOpen(o => !o)}
        >
          <img
            src="/img/filtering_img.png"
            alt="필터링"
            className="filter-img"
          />
        </button>
      </h2>

      {/* 필터 패널 */}
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
                className={`btn btn-outline-primary m-1 ${
                  !selectedGu ? "active" : ""
                }`}
                onClick={() => setSelectedGu("")}
              >
                전체
              </button>
              {guOptions.map(gu => (
                <button
                  key={gu}
                  className={`btn btn-outline-primary m-1 ${
                    selectedGu === gu ? "active" : ""
                  }`}
                  onClick={() => setSelectedGu(gu)}
                >
                  {gu}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 카드 리스트 + infinite scroll */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {currentItems.map((row, idx) => (
          <div
            key={idx}
            className="card mb-3 card-hover"
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              maxWidth: "800px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <Link
              to={`/stoprestaurant/${encodeURIComponent(row.upso_nm)}`}
              target="_blank"
              style={{ textDecoration: "none", color: "inherit", width: "100%" }}
            >
              <div className="card-body" style={{ padding: "1rem" }}>
                <h5 style={{ fontWeight: 600 }}>{row.upso_nm}</h5>
                <p>📍 {row.SITE_ADDR_RD || row.SITE_ADDR}</p>
                <p>업종: {row.SNT_UPTAE_NM}</p>
                <p>위반일자: {row.VIOR_YMD || "미제공"}</p>
                <p>조치: {row.DISPO_CTN || "없음"}</p>
                <small className="text-muted">
                  행정처분일: {row.ADM_DISPO_YMD || "미제공"}
                </small>
              </div>
            </Link>
          </div>
        ))}

        {hasMore && (
          <InfiniteScrollTrigger
            onIntersect={handleLoadMore}
            hasMore={hasMore}
          />
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
