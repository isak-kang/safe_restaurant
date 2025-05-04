import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "./pages/Main";
import RestaurantDetail from "./pages/RestaurantDetail";
import Header from './components/Header';
import MainMapPage from "./pages/MainMap";
import StopRestaurant from "./pages/StopRestaurant";
import Join from "./pages/Join";
import Login from "./pages/Login";
import AnalysisViolationPage from "./pages/Analysis";
import { useState } from "react";
import HygieneDetailPage from "./pages/HygieneDetailPage";
import Home from "./pages/Home";
import Favorite from "./pages/Favorite";
// import AnalysisChart from "./pages/Test";
function App() {
  const [userId, setUserId] = useState(null); // 로그인 사용자 ID 저장

  // 로그인 성공 콜백
  const handleLoginSuccess = (user_id) => {
    console.log("로그인 성공! 유저 ID:", user_id);
    setUserId(user_id);
    localStorage.setItem("user_id", user_id);
    window.location.href = "/"; // ✅ 홈으로 리다이렉트 (useNavigate도 가능)
  };

  return (
    <Router>
      <Header />
      <div>
        <Routes>
          <Route path="/list" element={<MainPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:upso_nm" element={<RestaurantDetail />} />
          <Route path="/stoprestaurant/:upso_nm" element={<HygieneDetailPage />} />
          <Route path="/main_map" element={<MainMapPage />} />
          <Route path="/stoprestaurant" element={<StopRestaurant />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/favorite" element={<Favorite />} />
          <Route path="/analysis" element={<AnalysisViolationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
