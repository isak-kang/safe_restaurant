import React, { useEffect, useState } from 'react';
import { fetchFilterOptions, fetchAnalysisViolationCategory, fetchAnalysisYear } from '../api/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import {AnalysisMarkdown} from '../components/AnalysisMarkdown';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1',
  '#d0ed57', '#a4de6c', '#d88884', '#84b6f4', '#ffb6c1'
];

export function AnalysisViolationPage() {
  const [guOptions, setGuOptions] = useState([]);
  const [selectedGu, setSelectedGu] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [yearData, setYearData] = useState([]);

  useEffect(() => {
    fetchFilterOptions()
      .then(res => setGuOptions(res.guOptions))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAnalysisViolationCategory(selectedGu)
      .then(setCategoryData)
      .catch(console.error);
    fetchAnalysisYear(selectedGu)
      .then(setYearData)
      .catch(console.error);
  }, [selectedGu]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-end mb-4">
        <select
          className="form-select w-auto"
          value={selectedGu}
          onChange={e => setSelectedGu(e.target.value)}
        >
          <option value="">전체</option>
          {guOptions.map(gu => (
            <option key={gu} value={gu}>{gu}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 shadow p-3 rounded bg-white">
        <h5 className="text-center mb-3">위반 항목별 비율</h5>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="count"
              nameKey="violation_category"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
            >
              {categoryData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 shadow p-3 rounded bg-white">
        <h5 className="text-center mb-3">연도별 위반 발생 수</h5>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={yearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="모범음식점" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card mt-4">
        <div className="card-header fw-bold">지역 상세 분석 리포트</div>
        <div className="card-body">
          <AnalysisMarkdown gu={selectedGu || '서울시전체'} />
        </div>
      </div>
    </div>
  );
}

export default AnalysisViolationPage;
