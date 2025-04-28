// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SideMenu from './SideMeun';

function Header() {
  const location = useLocation();
  const isMapPage = location.pathname === '/main_map';

  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setFilterOpen(false);
    navigate('/');
  };

  const headerStyle = {
    ...styles.header,
    position: isMapPage ? 'absolute' : 'sticky',
    top: 0,
    backgroundColor: isMapPage ? 'rgba(255,255,255,0.9)' : '#ffffff',
    zIndex: isMapPage ? 1000 : 100,
    
  };

  return (
    <header style={headerStyle}>
      <div style={styles.title}>안전한식당</div>
      <Link to="/"><img src="/img/home_img.png" alt="홈" className="filter-img" /></Link>
      <Link to="/main_map"><img src="/img/map_img.png" alt="맵" className="filter-img" /></Link>
      <Link to="/list"><img src="/img/list_img.png" alt="리스트" className="filter-img" /></Link>
      <Link to="/stoprestaurant"><img src="/img/stop_img.png" alt="위반업소" className="filter-img" /></Link>
      <Link to="/favorite"><img src="/img/heart_img.png" alt="즐겨찾기" className="filter-img" /></Link>
      <div onClick={() => setFilterOpen(true)}>
        <img src="/img/option_img.png" alt="옵션" className='filter-img' />
      </div>

      <SideMenu filterOpen={filterOpen} setFilterOpen={setFilterOpen}>
        <div className="filter-header mb-3"><h4 className="text-center m-0">필터</h4></div>
        {isLoggedIn ? (
          <div onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</div>
        ) : (
          <Link to="/login" onClick={() => setFilterOpen(false)}><div>로그인</div></Link>
        )}

      </SideMenu>
    </header>
  );
}

const styles = {
  header: {
    width: '100vw',
    maxWidth: '100%',
    height: '10vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default Header;
