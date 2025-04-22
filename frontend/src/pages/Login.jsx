import React, { useState } from 'react';
import { login } from '../api/api'; // 네 login API 경로에 맞게 수정 필요
import '../styles/Login.css'; // 필요하면 CSS 따로 관리
import { Link } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await login(formData);
      onLoginSuccess(data.user_id); // 로그인 성공 시 user_id 전달
    } catch (err) {
        console.error('Login error:', err); 
        if (err.response) {
        setErrorMsg(err.response.data.error || '로그인 실패');
      } else {
        setErrorMsg('서버 연결 실패');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="id">아이디</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <Link to={"/join"}>
            <div>회원가입</div>
        </Link>
    </div>
  );
}

export default Login;
