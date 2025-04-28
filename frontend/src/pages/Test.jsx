import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function AnalysisChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:7777/api/analysis')
    .then(response => {
      const { model_count = [], disposition_count = [] } = response.data;
      // 방어코딩: undefined 방지용 기본값 []
      const map = {};
      model_count.forEach(({ gu, cnt }) => map[gu] = { gu, model: cnt, disposition: 0 });
      disposition_count.forEach(({ gu, cnt }) => {
        if (!map[gu]) map[gu] = { gu, model: 0, disposition: cnt };
        else map[gu].disposition = cnt;
      });
      setData(Object.values(map));
    })
    .catch(console.error);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="gu" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="model" name="모범음식점" fill="#8884d8" />
        <Bar dataKey="disposition" name="행정처분 업소" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}