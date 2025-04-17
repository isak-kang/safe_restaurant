import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchRestaurants, fetchFilterOptions } from "../api/api";
import Pagination from "../components/Pagination";
import ModelRestaurantCard from "../components/Model_restaurant_card";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function Main() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedGu, setSelectedGu] = useState(searchParams.get("gu") || "");
  const [selectedUptae, setSelectedUptae] = useState(searchParams.get("uptae") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("name") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  const [data, setData] = useState([]);
  const [guOptions, setGuOptions] = useState([]);
  const [uptaeOptions, setUptaeOptions] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filterRef = useRef(null);  // 👉 필터 패널 참조

  const itemsPerPage = 5;

  // 🔁 URL 상태 업데이트 함수
  const updateURLParams = (gu, uptae, name, page) => {
    const newParams = {};
    if (gu) newParams.gu = gu;
    if (uptae) newParams.uptae = uptae;
    if (name) newParams.name = name;
    if (page) newParams.page = page;
    setSearchParams(newParams);
  };

  // 🔎 필터 변경 시 URL 갱신
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateURLParams(selectedGu, selectedUptae, searchTerm, 1);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedGu, selectedUptae, searchTerm]);

  // 📦 필터 옵션 로딩
  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchFilterOptions();
      setGuOptions(options.guOptions);
      setUptaeOptions(options.uptaeOptions);
    };
    loadOptions();
  }, []);

  // 📡 쿼리 변화 시 데이터 로딩
  useEffect(() => {
    const gu = searchParams.get("gu") || "";
    const uptae = searchParams.get("uptae") || "";
    const name = searchParams.get("name") || "";
    const page = Number(searchParams.get("page")) || 1;

    setSelectedGu(gu);
    setSelectedUptae(uptae);
    setSearchTerm(name);
    setCurrentPage(page);

    const loadData = async () => {
      const result = await fetchRestaurants(gu, uptae, name);
      setData(result);
    };
    loadData();
  }, [searchParams]);

  // 📃 페이지네이션
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams(selectedGu, selectedUptae, searchTerm, page);
  };

  // 🔒 필터 열릴 때 스크롤 제한
  useEffect(() => {
    if (filterOpen) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
  }, [filterOpen]);

  // 👆 외부 클릭 시 필터 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
  
    document.addEventListener("click", handleClickOutside, true);
  
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [filterOpen]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = data.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="container py-4">
      <label className="mt-2">음식점 이름</label>
      <input
        className="form-control"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="예: 한우"
      />

      <h2 className="mb-4 d-flex justify-content-between align-items-center">
        <span className="mx-auto">📋 모범음식점 리스트</span>
        <button onClick={() => setFilterOpen(!filterOpen)} className="btn btn-primary btn-sm w-auto">
          <img src="/img/filtering_img.png" alt="필터링" className="filter-img" />
        </button>
      </h2>

      {/* 필터 패널 */}
      <div
        className={`filter-panel ${filterOpen ? "open" : ""}`}
        ref={filterRef}
      >
        <div className="filter-header position-relative mb-3">
          <button className="close-btn" onClick={() => setFilterOpen(false)}>&times;</button>
          <h4 className="text-center m-0">필터</h4>
        </div>
        <div className="p-3">
          <div className="filter-section mb-3">
            <label className="fw-bold mb-2">구 선택</label>
            <div className="btn-group flex-wrap" role="group">
              <button
                type="button"
                className={`btn btn-outline-primary m-1 ${selectedGu === "" ? "active" : ""}`}
                onClick={() => setSelectedGu("")}
              >
                전체
              </button>
              {guOptions.map((gu) => (
                <button
                  key={gu}
                  type="button"
                  className={`btn btn-outline-primary m-1 ${selectedGu === gu ? "active" : ""}`}
                  onClick={() => setSelectedGu(selectedGu === gu ? "" : gu)}
                >
                  {gu}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section mb-3">
            <label className="fw-bold mb-2">업태 선택</label>
            <div className="btn-group flex-wrap" role="group">
              <button
                type="button"
                className={`btn btn-outline-success m-1 ${selectedUptae === "" ? "active" : ""}`}
                onClick={() => setSelectedUptae("")}
              >
                전체
              </button>
              {uptaeOptions.map((uptae) => (
                <button
                  key={uptae}
                  type="button"
                  className={`btn btn-outline-success m-1 ${selectedUptae === uptae ? "active" : ""}`}
                  onClick={() => setSelectedUptae(selectedUptae === uptae ? "" : uptae)}
                >
                  {uptae}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 리스트 출력 */}
      {currentItems.length === 0 ? (
        <div className="alert alert-warning mt-4 text-center">
          해당 조건의 식당은 없습니다.
        </div>
      ) : (
        <>
          {currentItems.map((row, idx) => (
            <ModelRestaurantCard key={idx} row={row} onClick={() => {}} />
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default Main;
