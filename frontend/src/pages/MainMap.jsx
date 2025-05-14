import React, { useEffect, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { fetchFilterOptions, fetchMainMap } from '../api/api';
import { Link } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function MainMapPage() {
  const [guOptions, setGuOptions] = useState([]);
  const [uptaeOptions, setUptaeOptions] = useState([]);
  const [appliedGu, setAppliedGu] = useState('');
  const [appliedUptae, setAppliedUptae] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [appliedYearStart, setAppliedYearStart] = useState(1987);
  const [appliedYearEnd, setAppliedYearEnd] = useState(2025);
  const [tempName, setTempName] = useState('');
  const [mapData, setMapData] = useState([]);
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchFilterOptions().then(res => {
      setGuOptions(res.guOptions);
      setUptaeOptions(res.uptaeOptions);
    });
  }, []);

  useEffect(() => {
    const isInitial = !appliedGu && !appliedUptae && !appliedName && appliedYearStart === 1987 && appliedYearEnd === 2025;
    if (isInitial) {
      setMapData([]);
      return;
    }
    fetchMainMap(appliedGu, appliedUptae, appliedName, appliedYearStart, appliedYearEnd)
      .then(data => {
        setMapData(data);
        if (data.length) {
          setCenter({ lat: data[0].latitude, lng: data[0].longitude });
        }
      })
      .catch(console.error);
  }, [appliedGu, appliedUptae, appliedName, appliedYearStart, appliedYearEnd]);


  const handleSearch = () => {
    setAppliedName(tempName);
    setShowFilters(false);
  };  

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* 왼쪽 패널 */}
      <div
        style={{
          position: 'fixed', top: '10vh', left: panelOpen ? 0 : '-35%',
          width: '35%', height: '90vh', background: '#fff',
          boxShadow: '2px 0 6px rgba(0,0,0,0.2)', transition: 'left .3s',
          zIndex: 900, padding: '1rem', overflowY: 'auto'
        }}
      >
        <button onClick={() => setPanelOpen(false)} style={{ float: 'right', fontSize: '1.5rem', border: 'none', background: 'transparent' }}>
          &times;
        </button>

        {/* 검색 */}
        <h5>🖊️ 업소 이름</h5>
        <input
          type="text"
          value={tempName}
          onChange={e => setTempName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}          placeholder="예: 한우"
          style={{ width: '100%', padding: '.5rem', marginBottom: '.5rem' }}
        />
        <button
          className="btn btn-outline-primary mb-3 w-100"
          onClick={() => handleSearch()
          }
        >
          검색
        </button>

        {/* 필터 토글 버튼 */}
        <button
          className="btn btn-outline-secondary mb-3 w-100"
          onClick={() => setShowFilters(v => !v)}
        >
          {showFilters ? '필터 닫기 ▲' : '필터 열기 ▼'}
        </button>

        {/* 필터 영역 */}
        {showFilters && (
          <>
            {/* 구 선택 */}
            <h5>📍 구 선택</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <button onClick={() => setAppliedGu('')} className={appliedGu === '' ? 'btn btn-danger' : 'btn btn-outline-danger'}>초기화</button>
              {guOptions.map(gu => (
                <button key={gu} onClick={() => setAppliedGu(gu)} className={appliedGu === gu ? 'btn btn-primary' : 'btn btn-outline-primary'}>{gu}</button>
              ))}
            </div>

            {/* 업태 선택 */}
            <h5>🍴 업태 선택</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <button onClick={() => setAppliedUptae('')} className={appliedUptae === '' ? 'btn btn-danger' : 'btn btn-outline-danger'}>초기화</button>
              {uptaeOptions.map(ut => (
                <button key={ut} onClick={() => setAppliedUptae(ut)} className={appliedUptae === ut ? 'btn btn-success' : 'btn btn-outline-success'}>{ut}</button>
              ))}
            </div>

            {/* 연도 슬라이더 */}
            <h5>📅 연도 범위</h5>
            <Slider
              range
              min={1987}
              max={2025}
              allowCross={false}
              value={[appliedYearStart, appliedYearEnd]}
              onChange={([start, end]) => {
                setAppliedYearStart(start);
                setAppliedYearEnd(end);
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <small>{appliedYearStart}년</small>
              <small>{appliedYearEnd}년</small>
            </div>
          </>
        )}

        {/* 검색 결과 */}
        {mapData.length > 0 && (
          <div>
            {mapData.map((item, i) => (
              <div key={i} className="card mb-2 p-2 shadow-sm" style={{ display: 'flex', gap: '1rem' }}>
                <Link
                  to={`/restaurant/${encodeURIComponent(item.upso_nm)}`}
                  target="_blank"
                  style={{ textDecoration: "none", color: "inherit" }
                }
                >
                {/* 이미지 썸네일 */}
                {item.img_url && (
                  <img
                    src={item.img_url}
                    alt={item.upso_nm}
                    style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '6px' }}
                  />
                )}
                
                {/* 텍스트 정보 */}
                <div style={{ flex: 1 }}>
                  <strong>{item.upso_nm} ({item.ASGN_YY})</strong>
                  <div style={{ fontSize: '0.9rem' }}>{item.SITE_ADDR_RD}</div>
                  <div style={{ fontSize: '0.9rem' }}>주메뉴: {item.MAIN_EDF}</div>
                  <div style={{ fontSize: '0.9rem' }}>지정일: {item.ASGN_YMD}</div>
                  <div style={{ fontSize: '0.9rem' }}>평점: ⭐ {item.score}</div>
                </div>
                </Link>
                  <button
                    className="btn btn-sm btn-outline-primary mt-1"
                    onClick={() => {
                      setCenter({ lat: item.latitude, lng: item.longitude });
                      setSelectedMarker(i);
                    }}
                  >
                    지도에서 보기
                  </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={7}
        minLevel={7}
        onClick={() => setSelectedMarker(null)}
      >
        {mapData.map((item, i) => (
          <MapMarker
            key={i}
            position={{ lat: item.latitude, lng: item.longitude }}
            onClick={() => setSelectedMarker(i)}
          >
            {selectedMarker === i && (
              <div style={{ background:'#fff', padding:'5px 8px', borderRadius:'5px', boxShadow:'0 0 6px rgba(0,0,0,0.2)', whiteSpace:'nowrap' }}>
                <div>{item.upso_nm} ({item.ASGN_YY})</div>
                <div>주소 : {item.SITE_ADDR_RD}</div>
                <div>주메뉴 : {item.MAIN_EDF}</div>
                <div>지정일 : {item.ASGN_YMD}</div>
                <div>평점 :⭐ {item.score}</div>
                <div>
                <Link
                  to={`/restaurant/${encodeURIComponent(item.upso_nm)}`}
                  target="_blank"
                  style={{ display: 'inline-block', marginTop: '6px', padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', fontWeight: 'bold', fontSize: '13px', borderRadius: '4px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  자세히 보기
                </Link>
                </div>
                <button
                  onClick={() => {
                    const url = `https://map.kakao.com/link/to/${
                      encodeURIComponent(item.upso_nm)
                    },${item.latitude},${item.longitude}`;
                    window.open(url, '_blank');
                  }}
                  style={{ display: 'inline-block', marginTop: '6px', padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', fontWeight: 'bold', fontSize: '13px', borderRadius: '4px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}                >
                  길찾기
                </button>
              </div>
            )}
          </MapMarker>
        ))}
      </Map>

      {/* 패널 열기 버튼 */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          style={{
            position: 'fixed',
            top: '50%',
            left: 0,
            zIndex: 901,
            background: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0 6px 6px 0',
            cursor: 'pointer',
            transform: 'translateY(-50%)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          검색창 열기
        </button>
      )}

      {/* 패널 닫기 버튼 */}
      {panelOpen && (
        <button
          onClick={() => setPanelOpen(false)}
          style={{
            position: 'fixed',
            top: '50%',
            left: '35%',
            zIndex: 901,
            background: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0 6px 6px 0',
            cursor: 'pointer',
            transform: 'translateY(-50%)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          검색창 닫기
        </button>
      )}

    </div>
  );
}