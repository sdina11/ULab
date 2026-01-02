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
import { TowerData, HealthStatusLevels } from '../types';

interface Props {
  data: TowerData;
  onViewDetails: (tower: TowerData) => void;
}

const TowerCard: React.FC<Props> = ({ data, onViewDetails }) => {
  const currentHealth = data.trend[data.trend.length - 1].healthScore;
  const anomalies = data.trend.filter(p => p.anomaly);
  
  const statusColor = currentHealth >= 85 ? '#10b981' : currentHealth >= 70 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-10 opacity-[0.04] group-hover:scale-125 transition-transform duration-1000">
         <i className="fas fa-cubes text-7xl"></i>
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none">{data.name}</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">{data.category} Pillar</p>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
            {currentHealth}%
          </div>
          <div className="w-12 h-2 rounded-full mt-2" style={{ backgroundColor: statusColor }}></div>
        </div>
      </div>

      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stream Alignment</h4>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
            <i className="fas fa-link text-indigo-400 text-[9px]"></i>
            <span className="text-[9px] font-black text-indigo-600 uppercase">
              {data.supportedStreams.length} Linked
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.supportedStreams.map((s, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 whitespace-nowrap group-hover:bg-white group-hover:border-slate-200 group-hover:text-slate-600 transition-all">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full h-[110px] mb-8 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trend}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', padding: '12px' }} 
            />
            <Area 
              type="monotone" 
              dataKey="healthScore" 
              stroke={statusColor} 
              strokeWidth={4}
              fill={statusColor} 
              fillOpacity={0.05}
              isAnimationActive={false}
            />
            {anomalies.map((p, i) => (
               <ReferenceDot key={i} x={p.timestamp} y={p.healthScore} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
           <div className={`w-3 h-3 rounded-full ${anomalies.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {anomalies.length > 0 ? `${anomalies.length} Critical Faults` : 'Status: Optimal'}
           </span>
        </div>
        <button 
          onClick={() => onViewDetails(data)}
          className="px-6 py-3 bg-slate-900 rounded-[1.2rem] text-[10px] font-black text-white hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-xl shadow-slate-100 hover:shadow-indigo-200"
        >
          Analysis
        </button>
      </div>
    </div>
  );
};

export default TowerCard;