'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const GdgLogo = ({ className = "w-8 h-8" }) => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Google_Developer_Groups_logo.svg/512px-Google_Developer_Groups_logo.svg.png" alt="GDG Logo" className={`${className} object-contain`} />
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('join');
  const [teamId, setTeamId] = useState('');
  
  const [regForm, setRegForm] = useState({
    teamName: '', teamNumber: '', players: ['', '', '']
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  useEffect(() => {
    // any client-only side effects
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, x: -50, skewX: 10 }, show: { opacity: 1, x: 0, skewX: 0, transition: { type: "spring", stiffness: 60, damping: 20 } } };

  async function handleRegister(e) {
    e.preventDefault();
    if (!regForm.teamName || !regForm.teamNumber || regForm.players.some(p => !p.trim())) {
      setMsg({ text: 'ERR: PARAMETERS INCOMPLETE.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: regForm.teamName, teamNumber: parseInt(regForm.teamNumber), players: regForm.players.filter(Boolean) })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: `UPLINK ESTABLISHED. KEY: ${data.team.teamId}`, type: 'success' });
        setTimeout(() => window.location.href = `/team/${data.team.teamId}`, 2000);
      } else {
        setMsg({ text: data.error || 'AUTH FAILED.', type: 'error' });
        setLoading(false);
      }
    } catch {
      setMsg({ text: 'NETWORK ERR.', type: 'error' });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-950 text-gray-200 font-body flex flex-col selection:bg-gdg-blue/30 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/images/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen z-0"></div>
      <div className="cyber-grid absolute inset-0 pointer-events-none z-0"></div>
      
      {/* Massive Background GDG Watermark */}
      <div className="gdg-watermark-bg z-0 opacity-[0.03] animate-pulse-glow" style={{ filter: 'brightness(1.5) contrast(1.2)' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)] z-0 rotate-12"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[2px] h-full bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)] z-0 rotate-12"></div>

      {/* Floating Orbs */}
      <div className="ambient-orb orb-blue z-0"></div>
      <div className="ambient-orb orb-red z-0"></div>

      {/* Top Header - Slanted */}
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="relative z-50 w-full">
        <div className="clip-angled-br bg-dark-900/90 backdrop-blur-md border-b border-r border-white/10 p-6 md:px-12 flex justify-between items-center max-w-5xl mx-auto mt-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <GdgLogo className="w-8 h-8 animate-holo-flicker drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
            <div className="flex flex-col">
              <span className="font-display font-black tracking-[0.3em] text-white text-sm leading-tight">GDG_CORE</span>
              <span className="font-mono text-[9px] text-gdg-blue tracking-[0.4em] uppercase">Decode The Tech // 2026</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/leaderboard" className="font-display font-bold text-[10px] tracking-widest uppercase text-gray-400 hover:text-white transition-all flex items-center gap-2 group">
              <span className="w-2 h-2 bg-gdg-blue rounded-full group-hover:shadow-[0_0_10px_#4285F4]"></span> TELEMETRY
            </Link>
            <Link href="/admin" className="font-display font-bold text-[10px] tracking-widest uppercase text-gray-400 hover:text-white transition-all flex items-center gap-2 group">
              <span className="w-2 h-2 bg-gdg-red rounded-full group-hover:shadow-[0_0_10px_#EA4335]"></span> SUDO
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center max-w-[1500px] w-full mx-auto px-6 md:px-12 mt-10 z-10 gap-16 lg:gap-20">
        
        {/* Left Column: Typography */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 flex flex-col items-start text-left relative z-20">
          
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-1.5 border-l-2 border-gdg-green bg-gradient-to-r from-gdg-green/10 to-transparent mb-8">
            <span className="font-mono text-[10px] tracking-[0.4em] text-gdg-green uppercase font-bold animate-holo-flicker">SYS_ONLINE</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-display font-black leading-[0.85] relative z-10 uppercase flex flex-col items-start mb-6 drop-shadow-2xl">
            <div className="text-[5rem] md:text-[7rem] lg:text-[8rem] text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-600 tracking-tighter">
              DECODE
            </div>
            <div className="text-[4rem] md:text-[6rem] lg:text-[7rem] text-gradient-gdg mt-[-10px] lg:mt-[-15px] drop-shadow-[0_0_30px_rgba(66,133,244,0.2)]">
              THE_TECH
            </div>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="font-mono text-gray-400 text-sm md:text-base max-w-xl mb-12 font-light leading-relaxed border-l border-white/20 pl-6 relative">
            <div className="absolute left-[-1px] top-0 w-[2px] h-8 bg-gdg-blue animate-data-stream"></div>
            Initiate connection sequence. Form your unit, decrypt algorithmic challenges, and breach the global mainframe. Authorized by <span className="text-white font-bold tracking-wider">Google Developer Groups</span>.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            {[
              { title: 'PHASE 01: DECRYPT', color: 'gdg-blue' },
              { title: 'PHASE 02: ANALYZE', color: 'gdg-yellow' },
              { title: 'PHASE 03: REVERSE', color: 'gdg-red' },
            ].map((f, i) => (
              <div key={i} className={`clip-angled px-6 py-2.5 bg-dark-900 border border-${f.color}/30 text-white font-display text-[10px] tracking-widest font-bold uppercase relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-${f.color}/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700`}></div>
                <span className={`text-${f.color} mr-2 group-hover:animate-pulse`}>/</span> {f.title}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Interaction Console */}
        <motion.div initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="w-full max-w-lg lg:max-w-xl relative z-20 perspective-1000">
          
          {/* High-End Slanted Panel */}
          <div className="clip-angled bg-dark-900/80 backdrop-blur-3xl border border-white/10 p-1 relative shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 right-10 w-32 h-[1px] bg-gdg-blue shadow-[0_0_10px_#4285F4]"></div>
            <div className="absolute bottom-0 left-10 w-32 h-[1px] bg-gdg-red shadow-[0_0_10px_#EA4335]"></div>
            
            <div className="bg-dark-950 p-8 md:p-12 clip-angled h-full flex flex-col">
              
              {/* Internal Tabs */}
              <div className="flex gap-4 mb-10 border-b border-white/5 pb-4">
                <button onClick={() => setActiveTab('join')} className={`font-display text-[11px] font-black tracking-[0.3em] uppercase transition-all ${activeTab === 'join' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                  {activeTab === 'join' && <span className="text-gdg-blue mr-2">►</span>}UPLINK
                </button>
                <button onClick={() => setActiveTab('register')} className={`font-display text-[11px] font-black tracking-[0.3em] uppercase transition-all ${activeTab === 'register' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                  {activeTab === 'register' && <span className="text-gdg-yellow mr-2">►</span>}NEW_NODE
                </button>
              </div>

              <div className="min-h-[360px] relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'join' && (
                    <motion.div key="join" initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} className="h-full flex flex-col justify-center gap-8">
                      <div className="space-y-2">
                        <div className="font-mono text-[10px] text-gdg-blue tracking-[0.4em] uppercase">Authentication Required</div>
                        <div className="font-display text-2xl font-black text-white tracking-widest">ENTER ACCESS VECTOR</div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-10 bg-gdg-blue"></div>
                        <input
                          type="text" placeholder="ID: TM-001" value={teamId} onChange={e => setTeamId(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && teamId && (window.location.href = `/team/${teamId}`)}
                          className="w-full bg-transparent border-b border-white/20 px-6 py-4 text-white font-mono text-xl tracking-[0.2em] focus:border-gdg-blue outline-none transition-all placeholder:text-gray-700"
                        />
                      </div>
                      
                      <button onClick={() => teamId && (window.location.href = `/team/${teamId}`)} className="clip-angled-br w-full bg-gdg-blue/10 hover:bg-gdg-blue text-gdg-blue hover:text-white border border-gdg-blue/50 py-5 font-display font-black tracking-[0.3em] text-[11px] uppercase transition-all shadow-[0_0_20px_rgba(66,133,244,0.1)] hover:shadow-[0_0_30px_rgba(66,133,244,0.4)] mt-auto">
                        INITIATE CONNECTION
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'register' && (
                    <motion.div key="register" initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} className="h-full flex flex-col">
                      <form onSubmit={handleRegister} className="flex flex-col h-full gap-5">
                        
                        {msg.text && (
                          <div className={`p-3 font-mono text-[9px] tracking-widest uppercase border-l-2 ${msg.type === 'error' ? 'border-gdg-red text-gdg-red bg-gdg-red/10' : 'border-gdg-green text-gdg-green bg-gdg-green/10'}`}>
                            {msg.text}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-gray-500 tracking-[0.3em] uppercase">Designation</label>
                            <input required type="text" placeholder="CYBER_SQUAD" value={regForm.teamName} onChange={e => setRegForm({...regForm, teamName: e.target.value})} className="w-full bg-dark-800/50 border border-white/10 px-4 py-3 text-white font-mono text-xs focus:border-gdg-yellow outline-none transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-gray-500 tracking-[0.3em] uppercase">Sector ID</label>
                            <input required type="number" placeholder="01" min="1" value={regForm.teamNumber} onChange={e => setRegForm({...regForm, teamNumber: e.target.value})} className="w-full bg-dark-800/50 border border-white/10 px-4 py-3 text-white font-mono text-xs focus:border-gdg-yellow outline-none transition-colors" />
                          </div>
                        </div>

                        <div className="space-y-2 mt-2">
                           <div className="font-mono text-[9px] text-gray-500 tracking-[0.3em] uppercase">Operatives [3 REQ]</div>
                          {[0, 1, 2].map(idx => (
                            <div key={idx} className="flex items-stretch border border-white/5 bg-dark-800/30 focus-within:border-white/20 transition-colors">
                              <div className={`w-8 flex items-center justify-center font-mono text-[9px] border-r border-white/5 bg-dark-900 ${['text-gdg-blue', 'text-gdg-red', 'text-gdg-yellow'][idx]}`}>0{idx+1}</div>
                              <input required type="text" placeholder="NAME_ALIAS" value={regForm.players[idx]} onChange={e => { const newP = [...regForm.players]; newP[idx] = e.target.value; setRegForm({...regForm, players: newP}); }} className="w-full bg-transparent px-3 py-2 text-xs font-mono text-white outline-none placeholder:text-gray-700" />
                            </div>
                          ))}
                        </div>

                        <button type="submit" disabled={loading} className="clip-angled-br w-full bg-gdg-yellow/10 hover:bg-gdg-yellow text-gdg-yellow hover:text-black border border-gdg-yellow/50 py-5 font-display font-black tracking-[0.3em] text-[11px] uppercase transition-all hover:shadow-[0_0_30px_rgba(251,188,5,0.4)] mt-auto disabled:opacity-50">
                          {loading ? 'PROCESSING...' : 'REGISTER NODE'}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Decorative Tech Elements around the panel */}
          <div className="absolute -right-8 top-20 flex flex-col gap-2 opacity-50 hidden md:flex">
            {[1,2,3,4,5].map(i => <div key={i} className="w-6 h-1 bg-white/20"></div>)}
          </div>
          <div className="absolute -left-8 bottom-20 flex flex-col gap-2 opacity-50 hidden md:flex">
             <div className="w-1 h-12 bg-gdg-red/50"></div>
             <div className="w-1 h-4 bg-gdg-red/30"></div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center z-10 flex flex-col items-center gap-2">
         <GdgLogo className="w-5 h-5 opacity-50 saturate-0" />
         <div className="font-mono text-[8px] text-gray-600 tracking-[0.5em] uppercase">SECURE CONNECTION BY GOOGLE DEVELOPER GROUPS</div>
      </div>
    </div>
  );
}
