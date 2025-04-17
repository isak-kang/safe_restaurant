import React from 'react';

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.title}>안전한식당</div>

    </header>
  );
}

const styles = {
  header: {
    width: '100%',
    height: '60px',
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