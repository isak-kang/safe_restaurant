import React, { useEffect, useState } from 'react';
import { Map, MapMarker, MarkerClusterer } from 'react-kakao-maps-sdk';
import { fetchFilterOptions, fetchMainMap } from '../api/api';
import { Link } from 'react-router-dom';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';


export default function MainMapPage() {
  // 필터 옵션
  const [guOptions, setGuOptions] = useState([]);
  const [uptaeOptions, setUptaeOptions] = useState([]);

  // “적용된” 필터
  const [appliedGu, setAppliedGu]         = useState('');
  const [appliedUptae, setAppliedUptae]     = useState('');
  const [appliedName, setAppliedName]       = useState('');
  const [appliedYearStart, setAppliedYearStart] = useState(1987);
  const [appliedYearEnd, setAppliedYearEnd]   = useState(2025);

  // “입력 중” 임시값
  const [tempGu, setTempGu]           = useState('');
  const [tempUptae, setTempUptae]       = useState('');
  const [tempName, setTempName]         = useState('');
  const [tempYearStart, setTempYearStart] = useState(1987);
  const [tempYearEnd, setTempYearEnd]     = useState(2025);

  // 슬라이더 열기/닫기 토글
  const [panelOpen, setPanelOpen]       = useState(true);

  const [openGu, setOpenGu]         = useState(true);
  const [openUptae, setOpenUptae]     = useState(true);
  const [openYear, setOpenYear]     = useState(true);


  // 지도 데이터
  const [mapData, setMapData]         = useState([]);
  const [center, setCenter]           = useState({ lat: 37.5665, lng: 126.9780 });
  const [selectedMarker, setSelectedMarker] = useState(null);


  // 1) 구/업태 불러오기
  useEffect(() => {
    fetchFilterOptions().then(res => {
      setGuOptions(res.guOptions);
      setUptaeOptions(res.uptaeOptions);
    });
  }, []);

  // 2) “적용된” 필터가 바뀔 때마다 재조회
  useEffect(() => {
    // 초기 상태에서는 아무 필터도 안 넣었을 경우 마커 표시하지 않음
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
  

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* 좌측 패널 */}
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

        {/* 이름 검색 */}
        <h5>🖊️ 업소 이름</h5>
        <input
          type="text"
          value={tempName}
          onChange={e => setTempName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setAppliedName(tempName);
            }
          }}
          placeholder="예: 한우"
          style={{ width: '100%', padding: '.5rem', marginBottom: '.5rem' }}
        />
        <button
          className="btn btn-outline-primary mb-3 w-100"
          onClick={() => setAppliedName(tempName)}
        >
          검색
</button>

        {/* ── 2) 구 선택 섹션 ─────────────────────── */}
        <div>
          <h5 onClick={() => setOpenGu(o => !o)} style={{ cursor: 'pointer' }}>
            📍 구 선택 {openGu ? '▾' : '▸'}
          </h5>
          {openGu && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setAppliedGu('')}
                className={appliedUptae === '' ? 'btn btn-danger' : 'btn btn-outline-danger'}  // 🔴 여기 변경
                >
                초기화
              </button>
              {guOptions.map(gu => (
              <button
                key={gu}
                onClick={() => setAppliedGu(gu)}
                className={appliedGu === gu ? 'btn btn-primary' : 'btn btn-outline-primary'}
              >
                {gu}
              </button>
            ))}
            </div>
          )}
        </div>

        <hr/>

        {/* ── 3) 업태 선택 섹션 ───────────────────── */}
        <div>
          <h5 onClick={() => setOpenUptae(o => !o)} style={{ cursor: 'pointer' }}>
            🍴 업태 선택 {openUptae ? '▾' : '▸'}
          </h5>
          {openUptae && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setAppliedUptae('')}
                className={appliedUptae === '' ? 'btn btn-danger' : 'btn btn-outline-danger'}  // 🔴 여기 변경
                >
                초기화
              </button>
              {uptaeOptions.map(ut => (
                <button
                  key={ut}
                  onClick={() => setAppliedUptae(ut)}
                  className={appliedUptae === ut ? 'btn btn-success' : 'btn btn-outline-success'}
                >
                  {ut}
                </button>
              ))}
            </div>
          )}

        </div>
      
<hr/>

        {/* 연도 범위 슬라이더 */}

          <h5 onClick={() => setOpenYear(o => !o)} style={{ cursor: 'pointer' }}>
            🍴 연도 {openYear ? '▾' : '▸'}
          </h5>
          {openYear && (
            <>
              <h5>📅 지정 연도</h5>
              <div style={{ margin: '1rem 0' }}>
                <Slider
                  range
                  min={1987}
                  max={2025}
                  allowCross={false}
                  value={[appliedYearStart, appliedYearEnd]}
                  onChange={(value) => {
                    const [start, end] = value;
                    setAppliedYearStart(start);
                    setAppliedYearEnd(end);
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem'
                }}>
                  <small>{appliedYearStart}년</small>
                  <small>{appliedYearEnd}년</small>
                </div>
              </div>

            </>
          )}
          <br></br>
          <br></br>
          </div>

      {/* 카카오맵 */}
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={7}
        minLevel={7}
        onClick={() => setSelectedMarker(null)}  // 🔍 지도 클릭 시 마커 선택 해제
      >
        {mapData.map((item, i) => (
          <MapMarker
            key={i}
            position={{ lat: item.latitude, lng: item.longitude }}
            onClick={(e) => {
              setSelectedMarker(i);
            }}
          >
            {selectedMarker === i && (
              <div style={{
                background:'#fff',
                padding:'5px 8px',
                borderRadius:'5px',
                boxShadow:'0 0 6px rgba(0,0,0,0.2)',
                whiteSpace:'nowrap'
              }}>
                <div>{item.upso_nm} ({item.ASGN_YY})</div>
                <div>주소 : {item.SITE_ADDR_RD}</div>
                <div>주메뉴 : {item.MAIN_EDF}</div>
                <Link
                  to={`/restaurant/${encodeURIComponent(item.upso_nm)}`}
                  target="_blank"
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  자세히 보기
                </Link>
              </div>
            )}
          </MapMarker>
        ))}
      </Map>


      {/* 패널 토글 */}
      <button
        onClick={() => setPanelOpen(v => !v)}
        style={{
          position:'fixed', bottom:'1.5rem', left:'1.5rem',
          width:'48px', height:'48px', borderRadius:'50%',
          border:'none', background:'#007bff', color:'#fff',
          fontSize:'1.5rem', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
          zIndex:901
        }}
        aria-label="필터 토글"
        >
        🏷️
      </button>
    </div>
    
  );
}
