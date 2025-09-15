import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  value: number;
}

interface CryptoChartProps {
  data: ChartData[];
  color?: string;
  height?: number;
}

export function CryptoChart({ data, color = '#3B82F6', height = 200 }: CryptoChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Generate mock chart data
export function generateMockChartData(days: number, baseValue: number): ChartData[] {
  const data: ChartData[] = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Simulate price movements
    const change = (Math.random() - 0.5) * baseValue * 0.05;
    currentValue = Math.max(currentValue + change, baseValue * 0.5);
    
    data.push({
      time: date.toLocaleDateString(),
      value: currentValue
    });
  }
  
  return data;
}