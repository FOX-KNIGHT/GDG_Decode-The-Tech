'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const ROUND_COLORS = {
  1: { border: 'border-l-neon-cyan', text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', label: 'DECODE THE JARGON' },
  2: { border: 'border-l-neon-yellow', text: 'text-neon-yellow', bg: 'bg-neon-yellow/10', label: 'EMOJI PATTERN ANALYSIS' },
  3: { border: 'border-l-neon-magenta', text: 'text-neon-magenta', bg: 'bg-neon-magenta/10', label: 'REVERSE LOGIC GATE' },
};

const GdgLogo = ({ className = "w-6 h-6" }) => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Google_Developer_Groups_logo.svg/512px-Google_Developer_Groups_logo.svg.png" alt="GDG Logo" className={`${className} object-contain drop-shadow-md`} />
);

export default function TeamPage() {
  const { teamId } = useParams();
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin question panel
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminQuestions, setAdminQuestions] = useState([]);
  const [adminQLoading, setAdminQLoading] = useState(false);
  const [adminFilterRound, setAdminFilterRound] = useState(0);
  const [expandedQId, setExpandedQId] = useState(null);

  useEffect(() => {
    // Check if admin
    const pass = sessionStorage.getItem('admin_pass');
    if (pass) setIsAdmin(true);

    fetchTeam();
    const interval = setInterval(fetchTeam, 5000);
    return () => clearInterval(interval);
  }, [teamId]);

  async function fetchAdminQuestions() {
    if (adminQLoading) return;
    setAdminQLoading(true);
    try {
      const adminPass = sessionStorage.getItem('admin_pass') || '';
      const res = await fetch('/api/admin/questions', {
        headers: { 'x-admin-password': adminPass },
      });
      if (res.ok) {
        const { questions } = await res.json();
        setAdminQuestions(questions || []);
      }
    } catch {}
    setAdminQLoading(false);
  }

  function toggleAdminPanel() {
    if (!showAdminPanel && adminQuestions.length === 0) {
      fetchAdminQuestions();
    }
    setShowAdminPanel(prev => !prev);
  }

  async function fetchTeam() {
    try {
      const [teamRes, sessionRes] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch('/api/game/status'),
      ]);
      if (!teamRes.ok) { setError('NODE CONNECTION FAILED. VERIFY IDENTIFIER.'); setLoading(false); return; }
      const { team } = await teamRes.json();
      const { session } = await sessionRes.json();
      setTeam(team);
      setSession(session);
      setLoading(false);
    } catch {
      setError('TELEMETRY LOST. REFRESH CONNECTION.');
      setLoading(false);
    }
  }

  function enterArena() {
    router.push(`/play/${teamId}`);
  }

  const currentRound = session?.currentRound || 0;
  const isActive = session?.status?.includes('_active');
  const currentPlayer = team?.players[team?.currentPlayerIndex];

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-dark-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen"></div>
        <div className="font-display font-bold text-gdg-blue animate-pulse tracking-[0.3em] text-xl z-10 flex items-center gap-4">
          <span className="w-8 h-8 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#4285F4]"></span>
          ESTABLISHING SECURE LINK...
        </div>
      </div>
    );
  }

  if (team?.isDisqualified) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center gap-8 bg-dark-950 overflow-hidden select-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-gdg-red/5 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-gdg-red/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="text-[7rem] drop-shadow-[0_0_50px_rgba(234,67,53,0.8)] z-10 hover:scale-110 transition-transform animate-bounce">🚫</div>
        
        <div className="text-center z-10 glass-panel p-12 rounded-[2.5rem] border-2 border-gdg-red/60 shadow-[0_20px_80px_rgba(234,67,53,0.2)] max-w-2xl w-full mx-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gdg-red shadow-[0_0_20px_rgba(234,67,53,0.8)]" />
          <div className="font-mono text-[10px] text-gdg-red/60 tracking-[0.4em] uppercase mb-4">
            ANTI-CHEAT PROTOCOL ENGAGED
          </div>
          <div className="font-display font-black text-gdg-red text-4xl md:text-5xl tracking-widest uppercase mb-6 drop-shadow-[0_0_10px_rgba(234,67,53,0.5)]">
            TEAM BANNED
          </div>
          <div className="text-sm md:text-base font-mono text-gray-300 leading-relaxed mb-8">
            {team?.disqualifiedReason || 'Security violation detected — fullscreen was exited or tab switched during active round.'}
          </div>
          <div className="bg-gdg-red/10 border border-gdg-red/40 rounded-2xl px-6 py-5 font-mono text-sm text-gdg-red/80 tracking-wider">
            ⛔ Your team has been <span className="text-gdg-red font-bold">permanently locked out</span> of this session.
            <span className="text-gray-400 text-xs mt-2 block">A tournament administrator must unban your team to restore access.</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center gap-6 bg-dark-950 text-gray-200">
        <div className="text-5xl animate-bounce">⚠️</div>
        <div className="font-mono font-bold text-gdg-red text-xl tracking-widest uppercase z-10 glass-panel p-8 rounded-[2rem] border border-gdg-red/30 shadow-[0_0_20px_rgba(234,67,53,0.1)]">{error}</div>
        <Link href="/" className="z-10 mt-6">
          <button className="btn-premium btn-gdg-blue px-8 py-4 rounded-xl">ABORT CONNECTION</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-dark-950 text-gray-200 overflow-x-hidden font-body selection:bg-gdg-blue/30 selection:text-white">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen"></div>
      <div className="cyber-grid absolute inset-0 pointer-events-none"></div>
      
      {/* Background Orbs */}
      <div className="ambient-orb orb-blue"></div>
      <div className="ambient-orb orb-red"></div>

      {/* Top Floating Command Bar */}
      <div className="pt-8 px-6 relative z-50 flex justify-center animate-reveal-up">
        <div className="w-full max-w-[1400px] glass-panel rounded-full px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-white/5 shadow-glass">
          <Link href="/" className="font-display font-bold text-[10px] text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full border border-white/10 tracking-widest uppercase flex items-center gap-2">
            <span className="text-xl leading-none -mt-1">←</span> EXIT TERMINAL
          </Link>
          <div className="font-display font-black text-white tracking-[0.2em] text-sm md:text-xl flex items-center gap-3">
            <GdgLogo className="w-6 h-6 hover:scale-110 transition-transform" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {team?.teamName?.toUpperCase()}
            </span>
          </div>
          <div className="font-mono text-[10px] text-gray-400 tracking-[0.2em] uppercase bg-dark-900/80 px-6 py-2.5 rounded-full border border-white/5 hidden md:block shadow-inner">
            NODE_ID: <span className="text-white">{teamId}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 w-full max-w-[1400px] mx-auto animate-reveal-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Team header */}
        <div className="text-center mb-16 w-full relative">
          <div className="inline-block relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-gdg-blue/10 via-gdg-red/10 to-gdg-yellow/10 blur-[60px] -z-10 rounded-full"></div>
            <div className="font-mono text-[10px] text-gdg-blue tracking-[0.4em] mb-4 border border-gdg-blue/30 inline-block px-5 py-2 rounded-full bg-gdg-blue/5 shadow-[0_0_15px_rgba(66,133,244,0.1)] font-bold uppercase">
              ASSIGNED NODE // {String(team?.teamNumber).padStart(3, '0')}
            </div>
            <h1 className="font-display font-black text-5xl md:text-[5rem] lg:text-[6rem] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              {team?.teamName}
            </h1>
          </div>
        </div>

        {/* Players Bento Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 max-w-5xl mx-auto">
          {[0, 1, 2].map((idx) => {
            const player = team?.players[idx];
            const isPlaying = team?.currentPlayerIndex === idx && currentRound > 0 && isActive;
            const colors = ['gdg-blue', 'gdg-red', 'gdg-yellow'];
            const colorClass = colors[idx];
            const borderColors = ['border-gdg-blue/20', 'border-gdg-red/20', 'border-gdg-yellow/20'];
            
            return (
              <div
                key={idx}
                className={`p-8 rounded-[2.5rem] text-center transition-all duration-500 relative overflow-hidden glass-panel border ${borderColors[idx]} ${
                  isPlaying
                    ? `shadow-[0_20px_50px_rgba(var(--${colorClass}),0.15)] scale-[1.03] border-${colorClass}`
                    : `hover:-translate-y-2 hover:border-${colorClass}/50 bg-gradient-to-br from-white/[0.02] to-transparent`
                }`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorClass}/10 rounded-full blur-[40px] pointer-events-none`}></div>
                
                {isPlaying && (
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${colorClass} to-transparent animate-shimmer`} />
                )}
                {isPlaying && (
                  <div className={`absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] bg-${colorClass} text-white px-4 py-1.5 rounded-full font-bold tracking-widest z-10 shadow-[0_0_10px_currentColor]`}>
                    ACTIVE OPERATOR
                  </div>
                )}
                
                <div className={`text-6xl mb-6 mt-6 ${isPlaying ? 'opacity-100 animate-pulse' : 'opacity-40'} transition-opacity drop-shadow-2xl`}>
                  {['🧠', '⚡', '🎯'][idx]}
                </div>
                <div className="font-mono text-[10px] text-gray-500 tracking-[0.3em] mb-2 uppercase">Operative 0{idx + 1}</div>
                <div className={`font-display font-black text-2xl truncate uppercase tracking-wider ${isPlaying ? `text-${colorClass} drop-shadow-[0_0_15px_currentColor]` : `text-white group-hover:text-${colorClass}`}`}>
                  {player?.name || 'AWAITING'}
                </div>
                <div className="font-mono text-[10px] text-gray-600 mt-6 border-t border-white/5 pt-5 uppercase tracking-widest">
                  Assigned Phase: {idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
          {/* Score summary */}
          <div className="p-8 md:p-10 rounded-[3rem] glass-panel border border-white/5 shadow-glass w-full flex flex-col justify-center relative overflow-hidden bg-gradient-to-b from-dark-900/80 to-dark-950/80">
            <div className="absolute top-[-50%] left-[-10%] w-[150%] h-[150%] bg-gdg-blue/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5 relative z-10">
              <span className="w-2.5 h-2.5 rounded-full bg-gdg-blue animate-pulse shadow-[0_0_10px_#4285F4]" />
              <div className="font-display font-bold text-white text-lg tracking-[0.2em] uppercase">Performance Metrics</div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center relative z-10">
              {['round1', 'round2', 'round3', 'total'].map((key, i) => (
                <div key={key} className={`p-5 rounded-[1.5rem] transition-transform hover:-translate-y-1 ${key === 'total' ? 'bg-gdg-blue/10 border border-gdg-blue/30 shadow-[inset_0_0_20px_rgba(66,133,244,0.1)]' : 'bg-dark-900/80 border border-white/5 shadow-inner'}`}>
                  <div className={`font-display font-black text-3xl md:text-4xl ${key === 'total' ? 'text-gdg-blue drop-shadow-[0_0_15px_rgba(66,133,244,0.4)]' : 'text-white'}`}>
                    {team?.scores[key] || 0}
                  </div>
                  <div className={`font-mono text-[9px] mt-2 tracking-widest uppercase ${key === 'total' ? 'text-gdg-blue font-bold' : 'text-gray-500'}`}>
                    {key === 'total' ? 'Total Cycles' : `Phase 0${i + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game status & action */}
          <div className="p-8 md:p-10 rounded-[3rem] glass-panel border border-white/5 shadow-glass w-full flex flex-col relative overflow-hidden text-center h-full bg-gradient-to-b from-dark-900/80 to-dark-950/80">
            <div className="absolute top-[-50%] right-[-10%] w-[150%] h-[150%] bg-gdg-magenta/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="font-display font-bold text-white text-lg tracking-[0.2em] mb-8 pb-6 border-b border-white/5 flex justify-between items-center relative z-10 uppercase">
              <span>Mission Control</span>
              {currentRound > 0 && <span className="text-[10px] text-[#FF007F] bg-[#FF007F]/10 px-4 py-1.5 rounded-full border border-[#FF007F]/30 shadow-[0_0_10px_rgba(255,0,127,0.15)] font-bold tracking-widest">PHASE: {currentRound}/3</span>}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
              {session?.status === 'waiting' && (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-3 font-display font-bold text-sm text-gdg-yellow border border-gdg-yellow/40 bg-gdg-yellow/10 rounded-[2rem] px-6 py-6 w-full shadow-[inset_0_0_20px_rgba(251,188,5,0.1)] mb-4">
                    <span className="w-3 h-3 rounded-full bg-gdg-yellow animate-pulse shadow-[0_0_10px_currentColor]" />
                    AWAITING AUTHORIZATION...
                  </div>
                  <div className="font-mono text-[10px] text-gray-400 tracking-widest bg-dark-900/80 rounded-[1.5rem] px-4 py-4 border border-white/5 uppercase shadow-inner">
                    Maintain secure connection.
                  </div>
                </div>
              )}

              {isActive && (
                <div className="w-full space-y-6">
                  <div className="flex items-center justify-center gap-3 font-display font-bold text-lg text-gdg-green border border-gdg-green/40 bg-gdg-green/10 rounded-[2rem] px-6 py-6 w-full shadow-[inset_0_0_30px_rgba(52,168,83,0.15)]">
                    <span className="w-3.5 h-3.5 rounded-full bg-gdg-green animate-ping" />
                    <span>PHASE_0{currentRound} LIVE</span>
                  </div>
                  
                  {currentPlayer && (
                    <div className="bg-dark-900/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-inner">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gdg-green shadow-[0_0_10px_currentColor]" />
                      <div className="font-mono text-[9px] text-gray-500 tracking-[0.2em] mb-1 uppercase">Authorized Operator:</div>
                      <div className="font-display font-black text-3xl text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{currentPlayer.name}</div>
                    </div>
                  )}
                  
                  <button onClick={enterArena} className="w-full btn-premium btn-gdg-blue text-white font-display font-black text-xl py-5 rounded-[2rem] tracking-widest shadow-[0_0_30px_rgba(66,133,244,0.3)]">
                    ENTER ARENA
                  </button>
                </div>
              )}

              {session?.status?.includes('_ended') && !isActive && (
                <div className="w-full">
                  <div className="font-display font-bold text-sm text-[#FF007F] border border-[#FF007F]/30 bg-[#FF007F]/10 rounded-[2rem] px-6 py-8 w-full shadow-[inset_0_0_20px_rgba(255,0,127,0.1)] tracking-widest uppercase">
                    PHASE_0{currentRound} CONCLUDED. AWAITING DIRECTIVES...
                  </div>
                </div>
              )}

              {session?.status === 'finished' && (
                <div className="w-full space-y-6">
                  <div className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-gdg-blue to-gdg-red tracking-widest drop-shadow-[0_0_20px_rgba(66,133,244,0.3)] uppercase">
                    SIMULATION COMPLETE
                  </div>
                  <Link href="/leaderboard" className="block w-full">
                    <button className="w-full btn-premium btn-gdg-red py-5 rounded-[2rem] text-lg tracking-widest shadow-[0_0_30px_rgba(234,67,53,0.3)]">
                      VIEW GLOBAL RANKINGS
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Admin floating question panel trigger — only visible to admin */}
        {isAdmin && (
          <>
            {/* Floating toggle button */}
            <button
              onClick={toggleAdminPanel}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gdg-blue/90 hover:bg-gdg-blue border border-gdg-blue/50 text-white font-mono text-[10px] tracking-widest px-5 py-3 rounded-full shadow-[0_0_20px_rgba(66,133,244,0.4)] backdrop-blur-md transition-all hover:shadow-[0_0_30px_rgba(66,133,244,0.6)] uppercase"
              title="Admin: View Questions"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {showAdminPanel ? 'CLOSE PANEL' : 'ADMIN QUESTIONS'}
            </button>

            {/* Side drawer */}
            {showAdminPanel && (
              <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-dark-950/97 backdrop-blur-xl border-l border-gdg-blue/20 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-900/80 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-gdg-blue animate-pulse shadow-[0_0_10px_#4285F4]" />
                    <span className="font-display font-black text-white tracking-[0.2em] text-sm">ADMIN — ALL QUESTIONS</span>
                  </div>
                  <button onClick={() => setShowAdminPanel(false)} className="text-gray-500 hover:text-white transition-colors font-mono text-lg">✕</button>
                </div>

                {/* Round filter */}
                <div className="flex gap-2 px-4 py-3 border-b border-white/5 flex-shrink-0">
                  {[0, 1, 2, 3].map(r => (
                    <button key={r} onClick={() => setAdminFilterRound(r)}
                      className={`px-4 py-1.5 rounded-full font-mono text-[9px] tracking-widest uppercase transition-all border ${
                        adminFilterRound === r
                          ? 'bg-gdg-blue/20 border-gdg-blue text-gdg-blue'
                          : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                      }`}>
                      {r === 0 ? 'ALL' : `P0${r}`}
                    </button>
                  ))}
                  <button onClick={fetchAdminQuestions} className="ml-auto text-gray-500 hover:text-gdg-blue transition-colors font-mono text-[9px] tracking-widest uppercase border border-white/10 hover:border-gdg-blue/30 px-3 py-1.5 rounded-full">
                    ↺ REFRESH
                  </button>
                </div>

                {/* Questions list */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
                  {adminQLoading ? (
                    <div className="text-center py-16">
                      <span className="w-8 h-8 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin inline-block mb-3 shadow-[0_0_15px_rgba(66,133,244,0.5)]" />
                      <div className="font-mono text-[10px] text-gdg-blue tracking-widest uppercase">Loading questions...</div>
                    </div>
                  ) : (
                    (adminFilterRound === 0 ? adminQuestions : adminQuestions.filter(q => q.round === adminFilterRound)).map((q, idx) => {
                      const c = ROUND_COLORS[q.round];
                      const isOpen = expandedQId === q._id;
                      return (
                        <div key={q._id} className={`rounded-2xl border-l-4 overflow-hidden transition-all bg-dark-900/80 ${c.border}`}>
                          <button
                            onClick={() => setExpandedQId(isOpen ? null : q._id)}
                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/[0.03] transition-colors"
                          >
                            <span className={`flex-shrink-0 font-mono text-[8px] font-bold px-2 py-1 rounded border tracking-widest uppercase ${c.bg} ${c.text} border-current`}>P0{q.round}</span>
                            <div className="flex-1 min-w-0">
                              {q.emojiClue && <div className="text-lg mb-1 tracking-widest">{q.emojiClue}</div>}
                              <div className="font-body text-white text-sm leading-snug font-medium pr-2">{q.question}</div>
                            </div>
                            <span className={`flex-shrink-0 font-mono text-[10px] mt-1 ${c.text} ${isOpen ? 'rotate-180' : ''} transition-transform`}>▼</span>
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                              {q.options?.map((opt, i) => {
                                const letter = ['A', 'B', 'C', 'D'][i];
                                const isCorrect = opt === q.correctAnswer;
                                return (
                                  <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-body border transition-all ${
                                    isCorrect
                                      ? 'bg-gdg-green/15 border-gdg-green text-white font-bold shadow-[0_0_10px_rgba(52,168,83,0.1)]'
                                      : 'bg-dark-950/60 border-white/5 text-gray-400'
                                  }`}>
                                    <span className={`font-mono text-[9px] flex-shrink-0 ${isCorrect ? 'text-gdg-green' : 'text-gray-600'}`}>[{letter}]</span>
                                    <span className="flex-1">{opt}</span>
                                    {isCorrect && <span className="text-gdg-green text-base">✓</span>}
                                  </div>
                                );
                              })}

                              {/* Correct answer summary */}
                              <div className="mt-2 bg-gdg-green/10 border border-gdg-green/30 rounded-xl px-3 py-2 flex items-center gap-2">
                                <span className="text-gdg-green text-sm">✓</span>
                                <div>
                                  <div className="font-mono text-[8px] text-gdg-green/60 tracking-widest uppercase">Correct Answer</div>
                                  <div className="font-display font-bold text-white text-sm">{q.correctAnswer}</div>
                                </div>
                                <div className="ml-auto font-mono text-[9px] text-gdg-green/60 tracking-widest">{q.basePoints} pts</div>
                              </div>

                              {q.round === 3 && q.actualFact && (
                                <div className="bg-gdg-yellow/10 border border-gdg-yellow/30 rounded-xl px-3 py-2 flex items-center gap-2">
                                  <span className="text-gdg-yellow text-sm">📋</span>
                                  <div>
                                    <div className="font-mono text-[8px] text-gdg-yellow/60 tracking-widest uppercase">Actual Fact</div>
                                    <div className="font-display font-bold text-white text-sm">{q.actualFact}</div>
                                  </div>
                                </div>
                              )}

                              {q.explanation && (
                                <div className="bg-dark-950/80 border border-white/5 rounded-xl px-3 py-2">
                                  <div className="font-mono text-[8px] text-gray-500 tracking-widest uppercase mb-1">Explanation</div>
                                  <div className="font-body text-gray-400 text-xs leading-relaxed">{q.explanation}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {!adminQLoading && adminQuestions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3 opacity-30">📭</div>
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">No questions found</div>
                    </div>
                  )}
                </div>

                {/* Stats footer */}
                <div className="flex-shrink-0 border-t border-white/5 px-6 py-3 bg-dark-900/80 flex gap-4">
                  {[1, 2, 3].map(r => (
                    <div key={r} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${r===1?'bg-neon-cyan':r===2?'bg-neon-yellow':'bg-neon-magenta'}`} />
                      <span className="font-mono text-[9px] text-gray-400 tracking-widest">P0{r}: {adminQuestions.filter(q => q.round === r).length}</span>
                    </div>
                  ))}
                  <span className="ml-auto font-mono text-[9px] text-gdg-blue tracking-widest">{adminQuestions.length} TOTAL</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
