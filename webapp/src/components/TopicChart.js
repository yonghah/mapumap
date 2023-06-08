import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend,  ResponsiveContainer } from 'recharts';
import { categoricalColorMap } from './map.js';

const BubbleChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/h.json');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  
  const renderScatters = () => {
    const topics = [...new Set(data.map(item => item.topic))];
    const populationGroups = [...new Set(data.map(item => item.pop_group))];

    return topics.map(topic => (
        <Scatter
          key={topic}
          data={data.filter(
            item => item.topic === topic)}
          fill={categoricalColorMap[topic]}
          shape="circle"
        />
      ))
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 20,
          right: 10,
          bottom: 20,
          left: 5 
        }}
      >
        <XAxis 
          type="number" 
          dataKey="topic" 
          name="Topic" 
          tick={{ fontSize: 11, fill:"#EEE" }}
          interval={0}
          orientation="top"
        />
        <YAxis 
          type="category" 
          dataKey="pop_group" 
          tick={{ fontSize: 12, fill:"#EEE" }}
          tickFormatter={(v)=> v.replace("POP_", "")}
          interval={0}
          reversed={true}
          name="Population Group" />
        <ZAxis type="number" dataKey="value" domain={[0,0.01]} range={[0,200]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {renderScatters()}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default BubbleChart;
