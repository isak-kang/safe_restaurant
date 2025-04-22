import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import SideMenu from './SideMeun';

function Header() {
  const [filterOpen, setFilterOpen] = useState(false); // 사이드 메뉴 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 저장
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token); // 토큰이 있으면 true, 없으면 false
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token'); // 토큰 삭제
    setIsLoggedIn(false); // 상태 업데이트
    setFilterOpen(false); // 사이드 메뉴 닫기
    navigate('/'); // 홈으로 리다이렉트
  };

  return (
    <header style={styles.header}>
      <div style={styles.title}>안전한식당</div>
      <Link to={"/"}>
        <div><img src="/img/home_img.png" alt="메인" className='filter-img' /></div>
      </Link>
      <Link to={"/main_map"}>
        <div><img src="/img/map_img.png" alt="맵" className='filter-img' /></div>
      </Link>
      <Link to={"/stoprestaurant"}>
        <div><img src="/img/stop_img.png" alt="행정처분레스토랑" className='filter-img' /></div>
      </Link>
      <div onClick={() => setFilterOpen(true)}> {/* 옵션 버튼 클릭 시 사이드 메뉴 열기 */}
        <img src="/img/option_img.png" alt="옵션" className='filter-img' />
      </div>

      {/* 사이드 메뉴 컴포넌트 */}
      <SideMenu filterOpen={filterOpen} setFilterOpen={setFilterOpen}>
        <div className="filter-header position-relative mb-3">
          <h4 className="text-center m-0">필터</h4>
        </div>

        {/* 로그인 여부에 따른 조건 분기 */}
        {isLoggedIn ? (
          <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
            로그아웃
          </div>
        ) : (
          <Link to={"/login"} onClick={() => setFilterOpen(false)}>
            <div>로그인</div>
          </Link>
        )}
        <div>설정</div>
        <div>이용약관</div>
      </SideMenu>
    </header>
  );
}

const styles = {
  header: {
    width: '100vw',
    maxWidth: '100vw',
    height: '10vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default Header;
