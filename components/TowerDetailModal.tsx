import React, { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  ReferenceDot
} from 'recharts';
import { ValueStreamData, TowerData } from '../types';
import { getTowerDeepDive } from '../services/geminiService';

interface Props {
  tower: ValueStreamData | TowerData;
  onClose: () => void;
}

const TowerDetailModal: React.FC<Props> = ({ tower, onClose }) => {
  const [insight, setInsight] = useState('Generating deep-dive assessment...');
  const anomalies = tower.trend.filter(p => p.anomaly);
  
  // Type guards for generic rendering
  const isValueStream = (t: any): t is ValueStreamData => 'phase' in t;
  const isTower = (t: any): t is TowerData => 'supportedStreams' in t;

  const title = isValueStream(tower) ? tower.name : tower.name;
  const subtitle = isValueStream(tower) ? tower.phase : (tower as TowerData).category;
  const outcomeLabel = isValueStream(tower) ? tower.outcome : `Supports ${ (tower as TowerData).supportedStreams.length } Value Streams`;

  useEffect(() => {
    getTowerDeepDive(tower as any).then(res => {
      setInsight(res);
    });
  }, [tower]);

  const getHealthColor = (val: number) => {
    if (val >= 85) return '#10b981';
    if (val >= 70) return '#f59e0b';
    return '#f43f5e';
  };

  const getSeverityStyles = (severity?: string) => {
    if (severity === 'HIGH') return 'text-rose-600 bg-rose-50 border-rose-100';
    return 'text-amber-600 bg-amber-50 border-amber-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <div>
            <div className="flex items-center gap-5">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{title}</h2>
              <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200">
                {subtitle}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{outcomeLabel}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
              <p className="text-slate-500 text-sm italic">{tower.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 flex items-center justify-center rounded-3xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all text-slate-400 group shadow-sm"
          >
            <i className="fas fa-times text-2xl group-hover:rotate-90 transition-transform"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Diagnostics */}
            <div className="lg:col-span-8 space-y-12">
              <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group/chart">
                <div className="flex justify-between items-center mb-10">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <i className="fas fa-chart-line text-indigo-500"></i>
                    Temporal Health Index
                  </h4>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Active Monitoring</span>
                </div>
                
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tower.trend}>
                      <defs>
                        <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickMargin={15} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="healthScore" 
                        stroke="#6366f1" 
                        strokeWidth={4}
                        fill="url(#detailGrad)" 
                        animationDuration={1500}
                      />
                      {tower.trend.map((point, idx) => (
                        point.anomaly && (
                          <ReferenceDot 
                            key={`detail-a-${idx}`}
                            x={point.timestamp} 
                            y={point.healthScore} 
                            r={8} 
                            fill="#f43f5e" 
                            stroke="#ffffff" 
                            strokeWidth={4}
                          />
                        )
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <i className="fas fa-brain text-indigo-300 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">AI Operational Synthesis</h4>
                    <p className="text-[9px] text-slate-500 font-bold">Deep learning predictive analysis</p>
                  </div>
                </div>
                <p className="text-2xl font-light italic leading-relaxed text-indigo-50 border-l-2 border-indigo-500/30 pl-8">
                  "{insight}"
                </p>
              </div>
            </div>

            {/* Right Column: KPIs & Events */}
            <div className="lg:col-span-4 space-y-12">
              <section>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">Key Diagnostics</h4>
                <div className="space-y-8">
                  {tower.subMetrics.map(metric => (
                    <div key={metric.label}>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{metric.label}</span>
                        <span className="text-lg font-black text-slate-900 leading-none">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                        <div 
                          className="h-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${metric.value}%`, 
                            backgroundColor: getHealthColor(metric.value) 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {isTower(tower) && (
                <section className="pt-8 border-t border-slate-100">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Stream Impact Mapping</h4>
                   <div className="flex flex-wrap gap-2">
                      {tower.supportedStreams.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <i className="fas fa-link text-indigo-400 text-[10px]"></i>
                          <span className="text-[10px] font-black text-indigo-700 uppercase">{s}</span>
                        </div>
                      ))}
                   </div>
                </section>
              )}

              <section className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Incident Log</h4>
                  {anomalies.length > 0 && (
                    <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-rose-100">
                      Critcal Attention
                    </span>
                  )}
                </div>
                
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                  {anomalies.length > 0 ? (
                    anomalies.map((anomaly, idx) => (
                      <div key={idx} className={`p-5 rounded-[1.5rem] border flex gap-4 items-start shadow-sm transition-all hover:translate-x-1 ${getSeverityStyles(anomaly.impactSeverity)}`}>
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${anomaly.impactSeverity === 'HIGH' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500'}`}></div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase opacity-60 tracking-wider">{anomaly.timestamp}</span>
                            <span className="text-[9px] font-black uppercase bg-white/50 px-2 py-0.5 rounded-full border border-current opacity-70">Impact: {anomaly.impactSeverity}</span>
                          </div>
                          <p className="text-sm font-bold leading-tight text-slate-800">{anomaly.anomalyDescription}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
                      </div>
                      <p className="text-sm font-black text-emerald-800 uppercase tracking-widest">Optimized State</p>
                      <p className="text-[10px] text-emerald-600/70 font-medium mt-1">NO ANOMALIES RECORDED</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-12 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-6">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all shadow-sm"
          >
            DISMISS DIAGNOSTICS
          </button>
          <button className="px-10 py-4 bg-slate-900 rounded-[1.5rem] text-xs font-black text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-3">
            <i className="fas fa-file-pdf text-indigo-400"></i>
            EXEC SUMMARY (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TowerDetailModal;