
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/Main"; // 식당 리스트 있는 메인
import RestaurantDetail from "./pages/RestaurantDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/restaurant/:upso_nm" element={<RestaurantDetail />} />
      </Routes>
    </Router>
  );
}

export default App;