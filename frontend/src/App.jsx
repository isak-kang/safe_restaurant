import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/Main"; // 식당 리스트 있는 메인
import RestaurantDetail from "./pages/RestaurantDetail";
import Header from './components/Header';
import MainMapPage from "./pages/MainMap";

function App() {
  return (
    <Router>
      <Header />  {/* 💡 모든 페이지 위에 항상 고정 표시 */}
      <div style={{ paddingTop: '60px' }}> {/* 💡 헤더 높이만큼 여백 확보 */}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/restaurant/:upso_nm" element={<RestaurantDetail />} />
          <Route path="/main_map" element={<MainMapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
