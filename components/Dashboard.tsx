import React, { useState, useEffect, useMemo } from 'react';
import { fetchValueStreamData, fetchTowerData } from '../services/mockData';
import { getExecutiveInsights } from '../services/geminiService';
import { ValueStreamData, TowerData, LifecyclePhase, ViewMode, OrchestrationEvent } from '../types';
import ValueStreamCard from './TowerHealthCard';
import TowerCard from './TowerCard';
import TowerDetailModal from './TowerDetailModal';

const Dashboard: React.FC = () => {
  const [streams, setStreams] = useState<ValueStreamData[]>([]);
  const [towers, setTowers] = useState<TowerData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('VALUE_STREAMS');
  const [aiInsight, setAiInsight] = useState('Aggregating Value Stream performance...');
  const [selectedItem, setSelectedItem] = useState<ValueStreamData | TowerData | null>(null);
  const [events, setEvents] = useState<OrchestrationEvent[]>([]);

  const refresh = () => {
    setStreams(fetchValueStreamData());
    setTowers(fetchTowerData());
  };

  useEffect(() => {
    refresh();
    const eventInterval = setInterval(() => {
      const actions = ['Remediating latency', 'Optimizing resource', 'Enforcing policy', 'Validating deployment', 'Syncing CMDB'];
      const streamNames = ['Detect-to-Correct', 'Change-to-Release', 'Regulate-to-Assure', 'Provision-to-Operate'];
      const newEvent: OrchestrationEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stream: streamNames[Math.floor(Math.random() * streamNames.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        status: Math.random() > 0.2 ? 'COMPLETED' : 'EXECUTING'
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 5));
    }, 5000);
    return () => clearInterval(eventInterval);
  }, []);

  useEffect(() => {
    if (streams.length > 0) {
      getExecutiveInsights(streams).then(setAiInsight);
    }
  }, [streams]);

  const phases: { id: LifecyclePhase, label: string, color: string, textColor: string, bgColor: string, icon: string }[] = [
    { id: 'PLAN_BUILD', label: 'Plan & Build', color: 'bg-sky-500', textColor: 'text-sky-700', bgColor: 'bg-sky-50', icon: 'fa-pencil-ruler' },
    { id: 'GOVERNANCE', label: 'Governance', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: 'fa-shield-halved' },
    { id: 'RUN_OPTIMIZE', label: 'Run & Optimize', color: 'bg-rose-400', textColor: 'text-rose-700', bgColor: 'bg-rose-50', icon: 'fa-gauge-high' }
  ];

  const phaseStats = useMemo(() => {
    return phases.map(p => {
      const phaseStreams = streams.filter(s => s.phase === p.id);
      const avg = phaseStreams.length > 0 
        ? Math.round(phaseStreams.reduce((acc, s) => acc + s.healthScore, 0) / phaseStreams.length)
        : 100;
      return { ...p, health: avg };
    });
  }, [streams]);

  const overallStats = useMemo(() => {
    if (streams.length === 0) return { avg: 0, automation: 0 };
    const avg = Math.round(streams.reduce((acc, s) => acc + s.healthScore, 0) / streams.length);
    const automation = Math.round(streams.reduce((acc, s) => acc + s.automationLevel, 0) / streams.length);
    return { avg, automation };
  }, [streams]);

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      {/* INTEGRATED CONTROL PLANE HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-layer-group text-2xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black tracking-tight leading-none">INTEGRATED CONTROL PLANE</h1>
                <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[9px] font-black text-indigo-400 uppercase tracking-widest">v3.1 Hub</span>
              </div>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Orchestration & Automation Hub</p>
            </div>
          </div>

          {/* Live Orchestration Pulse */}
          <div className="hidden xl:flex items-center gap-6 bg-slate-800/40 rounded-2xl px-6 py-3 border border-slate-700/50 max-w-lg flex-1 mx-10 overflow-hidden">
             <div className="flex-shrink-0 relative">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping absolute"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full relative"></div>
             </div>
             <div className="flex-1 overflow-hidden h-5">
                <div className="animate-in slide-in-from-bottom-2 duration-500">
                   {events.length > 0 && (
                     <div className="flex items-center gap-3 whitespace-nowrap">
                        <span className="text-[10px] font-black text-slate-500">{events[0].timestamp}</span>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase">{events[0].stream}:</span>
                        <span className="text-[10px] font-medium text-slate-300 truncate">{events[0].action}</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${events[0].status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 animate-pulse border border-amber-500/20'}`}>
                          {events[0].status}
                        </span>
                     </div>
                   )}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-800/80 rounded-2xl p-1.5 border border-slate-700">
              <button 
                onClick={() => setViewMode('VALUE_STREAMS')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${viewMode === 'VALUE_STREAMS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fas fa-stream"></i>
                VALUE STREAMS
              </button>
              <button 
                onClick={() => setViewMode('TOWERS')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${viewMode === 'TOWERS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fas fa-cubes"></i>
                IT TOWERS
              </button>
            </div>
            <button onClick={refresh} className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 shadow-xl">
              <i className="fas fa-sync-alt text-slate-400"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-10">
        {/* PERSISTENT SECTION 1: STRATEGIC PHASE SCOREBOARD */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {phaseStats.map(phase => (
            <div key={phase.id} className={`${phase.bgColor} border border-slate-200 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all`}>
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                  <i className={`fas ${phase.icon} text-7xl ${phase.textColor}`}></i>
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${phase.textColor}`}>{phase.label} Lifecycle</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{phase.health}%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Index</span>
                  </div>
                  <div className="mt-6 w-full h-2 bg-white/60 rounded-full overflow-hidden border border-slate-100">
                     <div 
                      className={`h-full ${phase.color} transition-all duration-1000 ease-out`} 
                      style={{ width: `${phase.health}%` }}
                     ></div>
                  </div>
               </div>
            </div>
          ))}
        </section>

        {/* PERSISTENT SECTION 2: AI INTELLIGENCE BANNER */}
        <section className="bg-white border border-slate-200 rounded-[3rem] p-10 mb-16 shadow-xl shadow-slate-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/4 h-full bg-indigo-500/[0.03] -skew-x-12 translate-x-24"></div>
           <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-2xl relative">
              <i className="fas fa-robot text-indigo-400 text-4xl"></i>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
           </div>
           <div className="flex-1 relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.3em]">AI Operational Synthesis</span>
                <div className="h-[1px] w-16 bg-indigo-100"></div>
              </div>
              <p className="text-2xl font-light text-slate-800 leading-relaxed italic pr-12">
                "{aiInsight}"
              </p>
           </div>
           <div className="hidden lg:flex flex-col items-end gap-2 pr-4 border-l border-slate-100 pl-10">
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Automation Reach</p>
                <p className="text-2xl font-black text-indigo-600 leading-none">{overallStats.automation}%</p>
              </div>
              <div className="text-right mt-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fleet Integrity</p>
                <p className="text-2xl font-black text-emerald-500 leading-none">{overallStats.avg}%</p>
              </div>
           </div>
        </section>

        {/* TOGGLEABLE CONTENT GRID */}
        {viewMode === 'VALUE_STREAMS' ? (
          <div className="space-y-24 animate-in fade-in duration-500">
            {phases.map(phase => (
              <section key={phase.id}>
                <div className="flex items-center gap-6 mb-10">
                  <div className={`w-2 h-8 ${phase.color} rounded-full`}></div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{phase.label} Streams</h2>
                  <div className="h-[1px] flex-1 bg-slate-200/50"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
                  {streams.filter(s => s.phase === phase.id).map(stream => (
                    <ValueStreamCard 
                      key={stream.id} 
                      data={stream} 
                      onViewDetails={(s) => setSelectedItem(s as any)} 
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="animate-in fade-in duration-500">
             <div className="flex items-center gap-6 mb-12">
                <div className="w-2 h-8 bg-slate-900 rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Unified Tower Assets</h2>
                <div className="h-[1px] flex-1 bg-slate-200/50"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain-Level Monitoring</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {towers.map(tower => (
                  <TowerCard 
                    key={tower.id} 
                    data={tower} 
                    onViewDetails={(t) => setSelectedItem(t as any)} 
                  />
                ))}
              </div>
          </section>
        )}

        {/* Footer Persistence */}
        <div className="mt-32 pt-20 border-t border-slate-100 text-center">
           <div className="inline-flex flex-col items-center gap-8">
              <div className="flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-slate-800">
                <i className="fas fa-microchip text-indigo-400 text-xl"></i>
                <span className="text-xs font-black uppercase tracking-[0.4em]">Unified Control Plane v3.1 • Orchestrating All Value Streams</span>
              </div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Enterprise Operating Model Governance • 2025</p>
           </div>
        </div>
      </main>

      {selectedItem && (
        <TowerDetailModal 
          tower={selectedItem as any} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;