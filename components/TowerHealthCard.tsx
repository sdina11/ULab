import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot,
  AreaChart,
  Area
} from 'recharts';
import { ValueStreamData, HealthStatusLevels } from '../types';

interface Props {
  data: ValueStreamData;
  onViewDetails: (stream: ValueStreamData) => void;
}

const ValueStreamCard: React.FC<Props> = ({ data, onViewDetails }) => {
  const currentHealth = data.trend[data.trend.length - 1].healthScore;
  const anomalies = data.trend.filter(function(p) { return p.anomaly; });
  
  const status = currentHealth >= 85 ? HealthStatusLevels.HEALTHY : 
                 currentHealth >= 70 ? HealthStatusLevels.WARNING : 
                 HealthStatusLevels.RISK;

  const getChartColor = (s: string) => {
    if (s === HealthStatusLevels.HEALTHY) return '#10b981';
    if (s === HealthStatusLevels.WARNING) return '#f59e0b';
    return '#f43f5e';
  };

  const chartColor = getChartColor(status);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{data.name}</h3>
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">{data.outcome}</p>
        </div>
        <div className="flex flex-col items-end">
           <div className={`text-xl font-black ${currentHealth >= 85 ? 'text-emerald-500' : currentHealth >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
            {currentHealth}%
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Health Index</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {data.contributingTowers.map((t, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm" title={t}>
              {t.substring(0, 1)}
            </div>
          ))}
        </div>
        <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
        <div className="flex items-center gap-1.5">
          <i className="fas fa-bolt text-indigo-400 text-[10px]"></i>
          <span className="text-[10px] font-bold text-slate-500">{data.automationLevel}% Automation</span>
        </div>
      </div>

      <div className="w-full h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trend}>
            <defs>
              <linearGradient id={`grad-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="healthScore" 
              stroke={chartColor} 
              strokeWidth={2.5}
              fill={`url(#grad-${data.id})`}
              isAnimationActive={false}
            />
            {anomalies.map((p, i) => (
               <ReferenceDot key={i} x={p.timestamp} y={p.healthScore} r={4} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
        <div className="flex items-center gap-1.5">
          {anomalies.length > 0 ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">{anomalies.length} Stream Interruptions</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Optimized Stream</span>
          )}
        </div>
        <button 
          onClick={() => onViewDetails(data)}
          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-[0.1em]"
        >
          View Diagnostics
        </button>
      </div>
    </div>
  );
};

export default ValueStreamCard;