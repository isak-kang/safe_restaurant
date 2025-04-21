import React from 'react';
import { Link } from "react-router-dom";

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.title}>안전한식당</div>
      <Link to={"/"}><div> <img src="/img/home_img.png" alt="메인인" className='filter-img'/></div></Link>
      <Link to={"/main_map"}><div> <img src="/img/map_img.png" alt="맵맵" className='filter-img'/></div></Link>
      <Link to={"/"}><div> <img src="/img/option_img.png" alt="옵션" className='filter-img'/></div></Link>
      <Link to={"/stoprestaurant"}><div> <img src="/img/stop_img.png" alt="행정처분레스토랑" className='filter-img'/></div></Link>
      
      
      
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