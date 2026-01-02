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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-full hover:shadow-lg hover:border-indigo-200 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-5 opacity-[0.05] group-hover:scale-110 group-hover:rotate-6 transition-all pointer-events-none">
         <i className="fas fa-cubes text-5xl"></i>
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="overflow-hidden">
          <h3 className="text-base font-black text-slate-900 truncate leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{data.name}</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{data.category} Pillar</p>
        </div>
        <div className="shrink-0 text-right ml-4">
           <div className="text-xl font-black text-slate-900 leading-none tracking-tighter">
            {currentHealth}%
          </div>
          <div className="w-10 h-1.5 rounded-full mt-2 ml-auto shadow-sm" style={{ backgroundColor: statusColor }}></div>
        </div>
      </div>

      <div className="mb-4 relative z-10 overflow-hidden h-5">
        <div className="flex flex-wrap gap-1.5">
          {data.supportedStreams.slice(0, 3).map((s, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-black text-slate-400 truncate max-w-[80px]">
              {s}
            </span>
          ))}
          {data.supportedStreams.length > 3 && (
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[9px] font-black border border-indigo-100">
              +{data.supportedStreams.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-[80px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', padding: '8px' }} 
            />
            <Area 
              type="monotone" 
              dataKey="healthScore" 
              stroke={statusColor} 
              strokeWidth={2}
              fill={statusColor} 
              fillOpacity={0.06}
              isAnimationActive={false}
            />
            {anomalies.map((p, i) => (
               <ReferenceDot key={i} x={p.timestamp} y={p.healthScore} r={3} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${anomalies.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {anomalies.length > 0 ? `${anomalies.length} Critical` : 'Normal'}
           </span>
        </div>
        <button 
          onClick={() => onViewDetails(data)}
          className="px-4 py-1.5 bg-slate-900 rounded-xl text-[10px] font-black text-white hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-200"
        >
          Explore
        </button>
      </div>
    </div>
  );
};

export default TowerCard;