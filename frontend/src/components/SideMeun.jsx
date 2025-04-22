import React, { useState, useEffect, useRef } from "react";
import '../App.css';

const SideMenu = ({ filterOpen, setFilterOpen, children }) => {
  const menuRef = useRef(null);

  // 메뉴 외부 클릭 시 닫히는 기능
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [setFilterOpen]);

  return (
    <div className={`filter-panel ${filterOpen ? "open" : ""}`} ref={menuRef}>
      <div className="menu-content">
        <button className="close-btn" onClick={() => setFilterOpen(false)}>&times;</button>
        <div className="menu-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
