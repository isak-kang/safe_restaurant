import React, { useState, useEffect } from 'react';
import { getProtectedData } from '../api/api'; // api 경로 수정 필요

function Test() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const data = await getProtectedData();
        setMessage(data.message); // 서버에서 받은 메시지
      } catch (err) {
        setError('인증되지 않은 사용자입니다.');
      }
    };

    fetchProtectedData(); // 컴포넌트가 마운트될 때 API 호출
  }, []);

  return (
    <div>
      <h1>{message || error}</h1> {/* 메시지 또는 오류 메시지 표시 */}
    </div>
  );
}   

export default Test;