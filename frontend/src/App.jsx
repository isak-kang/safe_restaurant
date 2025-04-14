import React, { useEffect, useState } from "react";
import { fetchRestaurants } from "./api/api";
import Pagination from "./components/Pagination";
import ModelRestaurantCard from "./components/Model_restaurant_card";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchRestaurants();
        setData(data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    loadData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">모범음식점 리스트</h2>

      {currentItems.map((row, idx) => (
        <ModelRestaurantCard key={idx} row={row} />
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default App;
