import React, { useEffect, useRef, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { fetchFilterOptions, fetchMainMap } from '../api/api';
import { Link } from 'react-router-dom';

function MainMapPage() {
  const [guOptions, setGuOptions] = useState([]);
  const [selectedGu, setSelectedGu] = useState('');
  const [mapData, setMapData] = useState([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const defaultCenter = { lat: 37.5665, lng: 126.9780 };
  const [center, setCenter] = useState(defaultCenter);

  // 1) 25개 구 옵션 로드
  useEffect(() => {
    fetchFilterOptions().then(res => setGuOptions(res.guOptions));
  }, []);

  // 2) 구 선택 시 지도 데이터 로드
  useEffect(() => {
    if (!selectedGu) {
      setMapData([]);
      setCenter(defaultCenter);
      return;
    }
    fetchMainMap(selectedGu).then(res => {
      setMapData(res);
      if (res.length) {
        setCenter({ lat: res[0].latitude, lng: res[0].longitude });
      }
    });
  }, [selectedGu]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh',overflowY: 'hidden' }}>

      {/* 3) 좌측 슬라이드 패널 */}
      <div
        style={{
          position: 'fixed',
          top: '10vh',
          left: panelOpen ? 0 : '-40%',
          width: '40%',
          height: '90vh',
          background: '#fff',
          boxShadow: '2px 0 6px rgba(0,0,0,0.2)',
          transition: 'left 0.3s ease',
          zIndex: 900,
          overflowY: 'auto',
          padding: '1rem'
        }}
      >
        <button
          onClick={() => setPanelOpen(false)}
          style={{
            marginBottom: '0.5rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >&times;</button>
        <h4 style={{ margin: '0.5rem 0' }}>구 선택</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => { setSelectedGu(''); setPanelOpen(false); }}
            style={{
              flex: '0 0 48%',
              padding: '0.5rem',
              border: selectedGu === '' ? '2px solid #007bff' : '1px solid #ccc',
              borderRadius: '4px',
              background: selectedGu === '' ? '#e7f1ff' : '#fff',
              cursor: 'pointer'
            }}
          >
            전체
          </button>
          {guOptions.map((gu, i) => (
            <button
              key={i}
              onClick={() => { setSelectedGu(gu); setPanelOpen(false); }}
              style={{
                flex: '0 0 48%',
                padding: '0.5rem',
                border: selectedGu === gu ? '2px solid #007bff' : '1px solid #ccc',
                borderRadius: '4px',
                background: selectedGu === gu ? '#e7f1ff' : '#fff',
                cursor: 'pointer'
              }}
            >
              {gu}
            </button>
          ))}
        </div>
      </div>

      {/* 4) 지도 */}
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={7}
      >
        {mapData.map((item, idx) => (
          <MapMarker
            key={idx}
            position={{ lat: item.latitude, lng: item.longitude }}
            onClick={() => setSelectedMarker(idx)}
          >
            {selectedMarker === idx && item.upso_nm && (
              <div style={{
                background: 'white',
                padding: '5px 8px',
                borderRadius: '5px',
                boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
                zIndex: 10
              }}>
                <Link
                  to={`/restaurant/${encodeURIComponent(item.upso_nm)}`}
                  target="_blank"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {item.upso_nm}
                </Link>
              </div>
            )}
          </MapMarker>
        ))}
      </Map>

      {/* 5) 좌측 하단 플로팅 버튼 */}
      <button
        onClick={() => setPanelOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '1.5rem',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: 'none',
          background: '#007bff',
          color: '#fff',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}
        aria-label="필터 열기"
      >
        🏷️
      </button>
    </div>
  );
}

export default MainMapPage;
