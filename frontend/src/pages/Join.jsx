import { registerUser } from "../api/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Join = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    confirm_password: "",
    name: "",
    email: "",
    address: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  try {
    const response = await registerUser(formData);
    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage(response.message);
      navigate("/login"); // 성공 시 로그인 페이지로 이동
    }
  } catch (error) {
    setMessage("회원가입 중 오류가 발생했습니다.");
  }
};


  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">회원가입</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block font-medium">아이디</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-medium">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="confirm_password" className="block font-medium">비밀번호 확인</label>
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="name" className="block font-medium">이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-medium">이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="address" className="block font-medium">주소</label>
          <select
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="" disabled>주소를 선택하세요</option>
            <option value="종로구">종로구</option>
            <option value="중구">중구</option>
            <option value="용산구">용산구</option>
            <option value="성동구">성동구</option>
            <option value="광진구">광진구</option>
            <option value="동대문구">동대문구</option>
            <option value="중랑구">중랑구</option>
            <option value="성북구">성북구</option>
            <option value="강북구">강북구</option>
            <option value="도봉구">도봉구</option>
            <option value="노원구">노원구</option>
            <option value="은평구">은평구</option>
            <option value="서대문구">서대문구</option>
            <option value="마포구">마포구</option>
            <option value="양천구">양천구</option>
            <option value="강서구">강서구</option>
            <option value="구로구">구로구</option>
            <option value="금천구">금천구</option>
            <option value="영등포구">영등포구</option>
            <option value="동작구">동작구</option>
            <option value="관악구">관악구</option>
            <option value="서초구">서초구</option>
            <option value="강남구">강남구</option>
            <option value="송파구">송파구</option>
            <option value="강동구">강동구</option>
            <option value="그 외">그 외 지역</option>
          </select>
        </div>

        <button type="submit">
          회원가입
        </button>

        {message && (
          <p className="mt-4 text-center text-red-600 font-semibold">{message}</p>
        )}
      </form>
    </div> 
  );
};

export default Join;
