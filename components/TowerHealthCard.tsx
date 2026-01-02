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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-full hover:shadow-lg hover:border-indigo-200 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight" title={data.name}>{data.name}</h3>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1.5 truncate">{data.outcome}</p>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-4">
           <div className={`text-xl font-black leading-none tracking-tighter ${currentHealth >= 85 ? 'text-emerald-500' : currentHealth >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
            {currentHealth}%
          </div>
          <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Health</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="flex -space-x-1.5 shrink-0">
          {data.contributingTowers.slice(0, 4).map((t, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-slate-50 border border-white flex items-center justify-center text-[8px] font-black text-slate-400 shadow-sm" title={t}>
              {t.substring(0, 1)}
            </div>
          ))}
        </div>
        <div className="h-3 w-px bg-slate-100"></div>
        <div className="flex items-center gap-1.5">
           <i className="fas fa-bolt text-indigo-400 text-[9px]"></i>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{data.automationLevel}% Automation</span>
        </div>
      </div>

      <div className="w-full h-[80px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
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
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', padding: '8px' }}
            />
            <Area 
              type="monotone" 
              dataKey="healthScore" 
              stroke={chartColor} 
              strokeWidth={2}
              fill={`url(#grad-${data.id})`}
              isAnimationActive={false}
            />
            {anomalies.map((p, i) => (
               <ReferenceDot key={i} x={p.timestamp} y={p.healthScore} r={3} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${anomalies.length > 0 ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {anomalies.length > 0 ? `${anomalies.length} Signals` : 'Optimized'}
          </span>
        </div>
        <button 
          onClick={() => onViewDetails(data)}
          className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-[0.2em] transition-colors"
        >
          View Insight
        </button>
      </div>
    </div>
  );
};

export default ValueStreamCard;