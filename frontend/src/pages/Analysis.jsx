import React, { useEffect, useState } from 'react';
import { fetchAnalysisViolationCategory, fetchFilterOptions ,fetchAnalysisGu,fetchAnalysisYear  } from '../api/api';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,BarChart,XAxis,Bar,YAxis
} from 'recharts';
import { AnalysisMarkdown } from '../components/AnalysisMarkdown';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#AF19FF', '#FF4560', '#4F81BD', '#9BBB59',
  '#8064A2', '#C0504D', '#5B9BD5', '#70AD47'
];

// 1) 구별 모범식당 vs 행정처분 업소 차트1
export function Test() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchAnalysisGu().then(({ model_count, disposition_count }) => {
      const map = {};
      model_count.forEach(({ gu, cnt }) => {
        map[gu] = { gu, model: cnt, disposition: 0 };
      });
      disposition_count.forEach(({ gu, cnt }) => {
        if (!map[gu]) map[gu] = { gu, model: 0, disposition: cnt };
        else map[gu].disposition = cnt;
      });
      setData(Object.values(map));
    }).catch(console.error);
  }, []);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <h3 className="text-center">구별 모범음식점 vs 행정처분 업소</h3>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="gu" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="model" name="모범음식점" fill="#8884d8" />
          <Bar dataKey="disposition" name="행정처분 업소" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2) 위반 내용별 분류 차트
// src/pages/AnalysisViolationPage.jsx


export function AnalysisViolTTationPage() {
  const [guOptions, setGuOptions] = useState([]);
  const [selectedGu, setSelectedGu] = useState('');

  const [categoryData, setCategoryData] = useState([]);
  const [yearData, setYearData] = useState([]);

  // 1) 구 목록 로드
  useEffect(() => {
    fetchFilterOptions()
      .then(res => setGuOptions(res.guOptions))
      .catch(console.error);
  }, []);

  // 2) selectedGu 바뀔 때마다 차트 데이터 로드
  useEffect(() => {
    fetchAnalysisViolationCategory(selectedGu)
      .then(records => setCategoryData(records))
      .catch(console.error);
    fetchAnalysisYear(selectedGu)
      .then(records => setYearData(records))
      .catch(console.error);
  }, [selectedGu]);

  return (
    <div style={{ padding: '1rem' }}>
      <h3 className="text-center mb-4">행정처분 분석 리포트</h3>
  
      {/* 구 선택 드롭다운 */}
      <div className="text-center mb-4">
        <select
          className="form-select w-auto d-inline-block"
          value={selectedGu}
          onChange={e => setSelectedGu(e.target.value)}
        >
          <option value="">전체</option>
          {guOptions.map(gu => (
            <option key={gu} value={gu}>{gu}</option>
          ))}
        </select>
      </div>
  
      {/* 차트 flex 컨테이너 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        {/* 파이차트 */}
        <div style={{ flex: 1, minWidth: '300px', height: 500 }}>
        <h4 className="text-center mb-3">🚨 위반 항목별 비율</h4>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="violation_category"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}  // 💡 비율 표시

              >
                {categoryData.map((entry, idx) => (
                  <Cell
                    key={entry.violation_category}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
  
        {/* 막대차트 */}
        <div style={{ flex: 1, minWidth: '300px', height: 500 }}>
        <h4 className="text-center mb-3">📊 연도별 위반 발생 수</h4>
          <ResponsiveContainer>
            <BarChart  data={yearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="모범음식점" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <AnalysisMarkdown gu={selectedGu || "서울시전체"} />
    </div>
  );
}  