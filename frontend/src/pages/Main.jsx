import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchRestaurants, fetchFilterOptions, getProtectedData} from "../api/api";
import ModelRestaurantCard from "../components/Model_restaurant_card";
import InfiniteScrollTrigger from "../components/InfiniteScrollTrigger"; // ✅ 추가
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';


function Main() {
  const [user, setUser] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [guOptions, setGuOptions] = useState([]);
  const [uptaeOptions, setUptaeOptions] = useState([]);
  const [selectedGu, setSelectedGu] = useState(searchParams.get("gu") || "");
  const [selectedUptae, setSelectedUptae] = useState(searchParams.get("uptae") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("name") || "");
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [appliedYearStart, setAppliedYearStart] = useState(1987);
  const [appliedYearEnd, setAppliedYearEnd] = useState(2025);
  const filterRef = useRef(null);

  // ✅ 현재 표시될 아이템 슬라이싱
  const currentItems = restaurants.slice(0, visibleCount);
  const hasMore = visibleCount < restaurants.length;

  // ✅ 무한 스크롤: onIntersect 콜백 정의
  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + 5);
    }
  }, [hasMore]);

  // URL 업데이트
  const updateURLParams = (gu, uptae, name, yearStart, yearEnd) => {
    const newParams = {};
    if (gu) newParams.gu = gu;
    if (uptae) newParams.uptae = uptae;
    if (name) newParams.name = name;
    if (yearStart) newParams.year_start = yearStart;
    if (yearEnd) newParams.year_end = yearEnd;
    setSearchParams(newParams);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateURLParams(selectedGu, selectedUptae, searchTerm, appliedYearStart, appliedYearEnd);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedGu, selectedUptae, searchTerm, appliedYearStart, appliedYearEnd]);

  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchFilterOptions();
      setGuOptions(options.guOptions);
      setUptaeOptions(options.uptaeOptions);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const gu = searchParams.get("gu") || "";
    const uptae = searchParams.get("uptae") || "";
    const name = searchParams.get("name") || "";
    const year_start = parseInt(searchParams.get("year_start")) || 1987;
    const year_end = parseInt(searchParams.get("year_end")) || 2025;

    setSelectedGu(gu);
    setSelectedUptae(uptae);
    setSearchTerm(name);
    setAppliedYearStart(year_start);
    setAppliedYearEnd(year_end);

    const loadData = async () => {
      const result = await fetchRestaurants(gu, uptae, name,year_end,year_start);
      setRestaurants(result);
      setVisibleCount(10); // 초기 10개만
    };
    loadData();
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, []);

  return (
    <div className="container py-4">
      {/* 검색 입력창 */}
      <label className="mt-2">음식점 이름</label>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <input
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="예: 한우"
          style={{ width: '50vw' }}
        />
      </div>
      {/* 타이틀 및 필터 버튼 */}
      <h2 className="mb-4 d-flex justify-content-between align-items-center">
        <span className="mx-auto">📋 {selectedGu} 모범음식점</span>
        <button onClick={() => setFilterOpen(!filterOpen)} className="btn btn-primary btn-sm w-auto">
          <img src="/img/filtering_img.png" alt="필터링" className="filter-img" />
        </button>
      </h2>
      
      {/* 필터 패널 */}
      <div className={`filter-panel ${filterOpen ? "open" : ""}`} ref={filterRef}>
        <div className="filter-header position-relative mb-3">
          <button className="close-btn" onClick={() => setFilterOpen(false)}>&times;</button>
          <h4 className="text-center m-0">필터</h4>
        </div>
        <div className="p-3">
          <div className="filter-section mb-3">
            <label className="fw-bold mb-2">구 선택</label>
            <div className="btn-group flex-wrap" role="group">
              <button
                className={`btn btn-outline-primary m-1 ${selectedGu === "" ? "active" : ""}`}
                onClick={() => setSelectedGu("")}
              >전체</button>
              {guOptions.map((gu) => (
                <button
                  key={gu}
                  className={`btn btn-outline-primary m-1 ${selectedGu === gu ? "active" : ""}`}
                  onClick={() => setSelectedGu(gu)}
                >{gu}</button>
              ))}
            </div>
          </div>

          <div className="filter-section mb-3">
            <label className="fw-bold mb-2">업종 선택</label>
            <div className="btn-group flex-wrap" role="group">
              <button
                className={`btn btn-outline-success m-1 ${selectedUptae === "" ? "active" : ""}`}
                onClick={() => setSelectedUptae("")}
              >전체</button>
              {uptaeOptions.map((uptae) => (
                <button
                  key={uptae}
                  className={`btn btn-outline-success m-1 ${selectedUptae === uptae ? "active" : ""}`}
                  onClick={() => setSelectedUptae(uptae)}
                >{uptae}</button>
              ))}
            </div>
          </div>
          <div className="filter-section mb-3">
            <label className="fw-bold mb-2">📅 연도 범위</label>
            <div className="px-2">
              <Slider
                range
                min={1987}
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

      {/* 결과 리스트 */}
      {restaurants.length === 0 ? (
        <div className="alert alert-warning mt-4 text-center">해당 조건의 식당은 없습니다.</div>
      ) : (
        <>
          {currentItems.map((row, idx) => (
            <ModelRestaurantCard key={idx} row={row} />
          ))}

          {/* ✅ 더보기 버튼 대신 무한스크롤 트리거 */}
          {hasMore && (
            <InfiniteScrollTrigger onIntersect={handleLoadMore} hasMore={hasMore} />
          )}
        </>
      )}
    </div>
  );
} 

export default Main;
