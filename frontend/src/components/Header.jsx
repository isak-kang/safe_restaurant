// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SideMenu from './SideMeun';

function Header() {
  const location = useLocation();
  const isMapPage = location.pathname === '/main_map';

  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [restaurantMenuOpen, setRestaurantMenuOpen] = useState(false);
  const [penaltyMenuOpen, setPenaltyMenuOpen] = useState(false);

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
      <div>
        <Link to="/" style={styles.link}><img src="/img/logo_img.png" alt="로고" className='filter-img' 
        style={{width:'100px',height:'100px',objectFit:'contain'}}/></Link>
      </div>

      {/* 모범 식당: hover로 토글 */}
      <div
        style={styles.title}
        onMouseEnter={() => setRestaurantMenuOpen(true)}
        onMouseLeave={() => setRestaurantMenuOpen(false)}
      >
        모범 음식점
        {restaurantMenuOpen && (
          <div style={styles.dropdownMenu}>
            <Link to="/list" style={styles.dropdownLink}>모범 음식점 리스트</Link>
            <Link to="/main_map" style={styles.dropdownLink}>모범 음식점 지도</Link>
          </div>
        )}
      </div>

      {/* 행정 처분: hover로 토글 */}
      <div
        style={styles.title}
        onMouseEnter={() => setPenaltyMenuOpen(true)}
        onMouseLeave={() => setPenaltyMenuOpen(false)}
      >
        행정 위반 음식점
        {penaltyMenuOpen && (
          <div style={styles.dropdownMenu}>
            <Link to="/stoprestaurant" style={styles.dropdownLink}>행정 위반 음식점 리스트</Link>
            <Link to="/analysis" style={styles.dropdownLink}>행정 위반 분석 자료</Link>
          </div>
        )}
      </div>

      <div style={styles.title}>
        <Link to="/favorite" style={styles.link}>즐겨찾기</Link>
      </div>

      <div style={styles.title}>
        <Link to="/login" style={styles.link}>로그인</Link>
      </div>



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
    position: 'relative',
  },
  title: {
    position: 'relative',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    cursor: 'pointer',
    border: '2px solid black',       
    padding: '6px 12px',             
    borderRadius: '6px',             
    display: 'inline-block',         
    margin: '0 8px',                
    textDecoration: 'none'           
  },
  dropdownMenu: {
    position: 'absolute',
    whiteSpace: 'nowrap',
    top: '100%',
    left: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem 0',
  },
  dropdownLink: {
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: '#333',
    fontSize: '16px',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
};

export default Header;