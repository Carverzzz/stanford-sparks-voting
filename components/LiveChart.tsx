import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface LiveChartProps {
  data: { name: string; votes: number; index: number }[];
  totalVotes: number;
  activeParticipants?: number; // 活跃参与人数
  highlightIndex?: number | null; // The correct answer index
  showAnswer: boolean;
}

export const LiveChart: React.FC<LiveChartProps> = ({ data, totalVotes, activeParticipants = 0, highlightIndex, showAnswer }) => {
  return (
    <div className="w-full h-64 md:h-80 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
          <YAxis 
            type="category" 
            dataKey="name" 
            hide 
            width={10} 
          />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            content={({ active, payload }) => {
                if (active && payload && payload.length) {
                return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-sm">
                    <p className="font-bold">{payload[0].value} votes</p>
                    </div>
                );
                }
                return null;
            }}
          />
          <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={60}>
            {data.map((entry, index) => {
              // Color logic
              let fill = '#e5e7eb'; // Default gray (WAITING/VOTING)
              
              if (showAnswer) {
                if (index === highlightIndex) {
                    fill = '#10b981'; // Green for Truth (Wait, game is find the Lie? If so, Green for correct selection)
                } else {
                    fill = '#ef4444'; // Red for wrong
                }
              } else {
                 // During voting, show gradient based on intensity relative to max
                 const maxVotes = Math.max(...data.map(d => d.votes)) || 1;
                 const intensity = entry.votes / maxVotes;
                 // Interpolate Stanford Red
                 // Simple approach: Opacity
                 fill = `rgba(140, 21, 21, ${0.3 + (intensity * 0.7)})`;
              }

              return (
                <Cell 
                    key={`cell-${index}`} 
                    fill={fill} 
                    className="transition-all duration-500 ease-in-out"
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Overlay Labels for better design */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2 pl-4 pr-12">
         {data.map((d, i) => (
             <div key={i} className="flex-1 flex items-center justify-between">
                 <span className="bg-white/80 px-2 py-1 rounded text-sm font-semibold truncate max-w-[70%] shadow-sm backdrop-blur-sm">
                    {d.name}
                 </span>
                 <div className="text-right">
                    <span className="font-bold text-stanford block">
                        {totalVotes > 0 ? Math.round((d.votes / totalVotes) * 100) : 0}%
                    </span>
                    {activeParticipants > 0 && (
                        <span className="text-xs text-ui-500 block">
                            {d.votes}/{activeParticipants}
                        </span>
                    )}
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
};