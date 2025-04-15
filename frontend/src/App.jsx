import React, { useEffect, useState } from "react";
import { fetchRestaurants,fetchFilterOptions} from "./api/api";
import Pagination from "./components/Pagination";
import ModelRestaurantCard from "./components/Model_restaurant_card";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState([]);
  const [guOptions, setGuOptions] = useState([]);
  const [uptaeOptions, setUptaeOptions] = useState([]);
  const [selectedGu, setSelectedGu] = useState("");
  const [selectedUptae, setSelectedUptae] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchFilterOptions();
      setGuOptions(options.guOptions);
      setUptaeOptions(options.uptaeOptions);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchRestaurants(selectedGu, selectedUptae, searchTerm);

      setData(result);
      setCurrentPage(1); // 필터 바뀌면 첫 페이지로
    };
    loadData();
  }, [selectedGu, selectedUptae,searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = data.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="container py-4">
      <h2 className="mb-4">📋 모범음식점 리스트</h2>

      <input
        type="text"
        className="form-control"
        placeholder="음식점 이름 검색"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />    

      {/* 필터링 영역 */}
      <div className="d-flex gap-3 mb-4">
        <select className="form-select" value={selectedGu} onChange={e => setSelectedGu(e.target.value)}>
          <option value="">구 선택</option>
          {guOptions.map(gu => (
            <option key={gu} value={gu}>{gu}</option>
          ))}
        </select>
        <select className="form-select" value={selectedUptae} onChange={e => setSelectedUptae(e.target.value)}>
          <option value="">업종 선택</option>
          {uptaeOptions.map(up => (
            <option key={up} value={up}>{up}</option>
          ))}
        </select>
      </div>

      {/* 카드 리스트 */}
      {currentItems.map((row, idx) => (
        <ModelRestaurantCard key={idx} row={row} />
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;