import React from 'react';
import { AreaChart, Area, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';

const SentimentPanel = ({ entries }) => {
  const getSentimentData = () => {
    return entries.filter(entry => entry.sentiment !== undefined).map(entry => ({
        date: new Date(entry.createdAt?.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sentiment: entry.sentiment,
    })).reverse(); 
  };
  const sentimentData = getSentimentData();
  
  const gradientOffset = () => {
    if (sentimentData.length === 0) return 0.5;
    const dataMax = Math.max(...sentimentData.map((i) => i.sentiment));
    const dataMin = Math.min(...sentimentData.map((i) => i.sentiment));
    if (dataMax <= 0) return 0; if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  };
  const off = gradientOffset();

  return (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in-up">
        <div className="bg-black/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 shadow-2xl w-96">
            <h3 className="text-green-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-2">Emotional Resonance</h3>
            <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentData}>
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={off} stopColor="#4ade80" stopOpacity={0.6} />
                                <stop offset={off} stopColor="#f87171" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <ReferenceLine y={0} stroke="#555" />
                        <Area type="monotone" dataKey="sentiment" stroke="url(#splitColor)" fill="url(#splitColor)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default SentimentPanel;