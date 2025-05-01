import React from 'react';
import { Map, MapMarker } from "react-kakao-maps-sdk";

function KakaoMap(props) {
  const { latitude, longitude, upso} = props;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
    <Map
      center={{ lat: latitude, lng: longitude }}
      style={{ width: '50%', height: '400px' }}
      level={3}
    >
      <MapMarker position={{ lat: latitude, lng: longitude }}>
        <div style={{ padding: '5px', color: '#000' }}>
          {upso}
        </div>
      </MapMarker>
    </Map>
    </div>
  );
}

export default KakaoMap;
