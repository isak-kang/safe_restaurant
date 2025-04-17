import React, { useEffect, useState, useRef } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { fetchFilterOptions, fetchMainMap } from '../api/api';

function MainMapPage() {
  const [guOptions, setGuOptions] = useState([]);
  const [selectedGu, setSelectedGu] = useState('');
  const [mapData, setMapData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 서울 중심 좌표 기본값
  const defaultCenter = { lat: 37.5665, lng: 126.9780 };

  useEffect(() => {
    const loadOptions = async () => {
      const res = await fetchFilterOptions();
      setGuOptions(res.guOptions);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (!selectedGu) {
      setMapData([]); // 선택 없으면 빈 리스트
      return;
    }

    const loadMap = async () => {
      const res = await fetchMainMap(selectedGu);
      console.log(res);
      setMapData(res);
    };
    loadMap();
  }, [selectedGu]);

  // 지도 중심 좌표
  const center = mapData.length
    ? { lat: mapData[0].latitude, lng: mapData[0].longitude }
    : defaultCenter;

  // 구 선택 핸들러
  const handleSelectGu = (gu) => {
    setSelectedGu(gu);
    setShowDropdown(false);
  };

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <div style={styles.wrapper} ref={dropdownRef}>
        <span>
          <span
            style={styles.selectable}
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            {selectedGu || '00구'}
          </span>
          의 모범식당은??
        </span>

        {showDropdown && (
          <div style={styles.dropdown}>
            {guOptions.map((gu, idx) => (
              <div
                key={idx}
                style={styles.dropdownItem}
                onClick={() => handleSelectGu(gu)}
              >
                {gu}
              </div>
            ))}
          </div>
        )}
      </div>

      <Map
        center={center}
        style={{ width: '100vh', height: '100vh' }}
        level={5}
      >
        {mapData.map((item, idx) => (
          <MapMarker
            key={idx}
            position={{ lat: item.latitude, lng: item.longitude }}
          />
        ))}
      </Map>
    </div>
  );
}

const styles = {
  wrapper: {
    margin: '1.5rem',
    fontSize: '20px',
    position: 'relative',
    zIndex: 10,
  },
  selectable: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  dropdown: {
    marginTop: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    position: 'absolute',
    padding: '0.5rem 0',
    width: '120px',
  },
  dropdownItem: {
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default MainMapPage;
