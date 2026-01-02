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
    <div className="min-h-screen bg-[#fcfdfe] pb-12">
      {/* BALANCED HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-layer-group text-lg"></i>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none uppercase">Integrated Control Plane</h1>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Operational Orchestration Hub</p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-4 bg-slate-800/40 rounded-xl px-4 py-2 border border-slate-700/50 flex-1 mx-6 overflow-hidden">
             <div className="flex-shrink-0 relative">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping absolute"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full relative"></div>
             </div>
             <div className="flex-1 overflow-hidden h-4 flex items-center">
                <div className="animate-in slide-in-from-bottom-1 duration-300 w-full">
                   {events.length > 0 && (
                     <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500">{events[0].timestamp}</span>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase shrink-0">{events[0].stream}:</span>
                        <span className="text-[10px] font-medium text-slate-300 truncate">{events[0].action}</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${events[0].status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {events[0].status}
                        </span>
                     </div>
                   )}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button 
                onClick={() => setViewMode('VALUE_STREAMS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'VALUE_STREAMS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                VALUE STREAMS
              </button>
              <button 
                onClick={() => setViewMode('TOWERS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'TOWERS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                IT TOWERS
              </button>
            </div>
            <button onClick={refresh} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 hover:bg-slate-700 transition-all">
              <i className="fas fa-sync-alt text-xs text-slate-400"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {/* EXECUTIVE SCOREBOARD - IMPROVED ALIGNMENT */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {phaseStats.map(phase => (
            <div key={phase.id} className={`${phase.bgColor} border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group transition-all hover:shadow-md hover:border-slate-300`}>
               <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${phase.color} bg-opacity-10 flex items-center justify-center border border-current border-opacity-20 shadow-sm transition-transform group-hover:scale-105`}>
                    <i className={`fas ${phase.icon} text-2xl ${phase.textColor}`}></i>
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${phase.textColor} opacity-80 mb-1 block`}>{phase.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 leading-none tracking-tight">{phase.health}%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-col items-end relative z-10">
                  <div className="h-2 w-28 bg-white rounded-full overflow-hidden border border-slate-200/50 mb-2 shadow-inner">
                    <div className={`h-full ${phase.color} transition-all duration-1000 ease-out`} style={{ width: `${phase.health}%` }}></div>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">Current Capacity</span>
               </div>

               {/* Decorative background element - now properly contained */}
               <div className="absolute -right-6 -bottom-6 opacity-[0.04] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 pointer-events-none">
                  <i className={`fas ${phase.icon} text-8xl ${phase.textColor}`}></i>
               </div>
            </div>
          ))}
        </section>

        {/* RE-ESTABLISHED AI SYNTHESIS BANNER */}
        <section className="bg-slate-900 rounded-[2rem] p-6 mb-10 shadow-2xl flex items-center gap-8 border border-slate-800 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/5 -skew-x-12 translate-x-32 group-hover:translate-x-28 transition-transform duration-1000"></div>
           
           <div className="flex-shrink-0 flex items-center gap-4 px-6 border-r border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-500/5">
                <i className="fas fa-robot text-indigo-400 text-xl"></i>
              </div>
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-0.5">Synthesis</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">GenAI Agent v4</span>
              </div>
           </div>

           <p className="text-lg font-medium text-slate-200 italic flex-1 leading-snug">
             "{aiInsight}"
           </p>

           <div className="flex items-center gap-8 shrink-0 pr-6 border-l border-slate-800 pl-8">
              <div className="text-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Automation</span>
                <span className="text-xl font-black text-indigo-400 leading-none">{overallStats.automation}%</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Integrity</span>
                <span className="text-xl font-black text-emerald-400 leading-none">{overallStats.avg}%</span>
              </div>
           </div>
        </section>

        {/* CONTENT GRID */}
        {viewMode === 'VALUE_STREAMS' ? (
          <div className="space-y-12">
            {phases.map(phase => (
              <section key={phase.id}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-1.5 h-6 ${phase.color} rounded-full shadow-sm`}></div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{phase.label} Streams</h2>
                  <div className="h-px flex-1 bg-slate-200/60"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <section>
             <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full shadow-sm"></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Unified Tower Assets</h2>
                <div className="h-px flex-1 bg-slate-200/60"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        
        <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">Integrated Control Plane • Enterprise IT Operating Model Governance</p>
        </footer>
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