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
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
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
