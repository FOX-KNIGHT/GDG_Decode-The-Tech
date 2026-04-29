'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const GdgLogo = ({ className = "w-6 h-6" }) => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Google_Developer_Groups_logo.svg/512px-Google_Developer_Groups_logo.svg.png" alt="GDG Logo" className={`${className} object-contain`} />
);

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setSession(data.session);
      setLastUpdated(new Date());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  const maxScore = leaderboard[0]?.scores.total || 1;

  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 relative overflow-hidden font-body selection:bg-gdg-blue/30 selection:text-white">
      {/* High-End Background Ambience */}
      <div className="absolute inset-0 bg-[url('/images/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen z-0"></div>
      <div className="cyber-grid absolute inset-0 pointer-events-none z-0"></div>
      <div className="gdg-watermark-bg z-0 opacity-[0.03] animate-pulse-glow" style={{ transform: 'translate(-50%, -50%) rotate(15deg) scale(1.2)' }}></div>

      <div className="ambient-orb orb-blue z-0 opacity-40"></div>
      <div className="ambient-orb orb-yellow z-0 opacity-40"></div>
      <div className="ambient-orb orb-green z-0 opacity-40"></div>

      {/* Futuristic Header */}
      <div className="border-b border-white/10 bg-dark-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="clip-angled-br font-mono text-[10px] text-gray-400 hover:text-white transition-colors tracking-[0.3em] flex items-center gap-3 bg-dark-950 px-6 py-3 border border-white/10 hover:border-white/30 uppercase">
            <span className="text-gdg-blue text-lg leading-none -mt-1 group-hover:animate-pulse">◄</span> BASE_UPLINK
          </Link>
          <div className="text-center relative flex flex-col items-center">
            <div className="absolute -inset-8 bg-gdg-blue/10 blur-2xl rounded-full -z-10 animate-pulse"></div>
            <div className="flex items-center gap-4 mb-2">
              <GdgLogo className="w-8 h-8 animate-holo-flicker grayscale brightness-200" />
              <div className="font-display font-black text-2xl md:text-3xl text-white tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                GLOBAL_TL
              </div>
            </div>
            <div className="font-mono text-[9px] text-gdg-blue tracking-[0.4em] bg-dark-950 px-6 py-1.5 border border-gdg-blue/30 uppercase shadow-[0_0_15px_rgba(66,133,244,0.15)] clip-hex">
              SYS_PHASE 0{session?.currentRound || 0} // <span className="text-white">{session?.status?.replace(/_/g, ' ') || 'STANDBY'}</span>
            </div>
          </div>
          <div className="font-mono text-[9px] text-gray-500 tracking-[0.4em] hidden md:block bg-dark-950 px-6 py-3 border border-white/10 uppercase clip-angled-tl">
            {lastUpdated ? `SYNC: ${lastUpdated.toLocaleTimeString()}` : '—'}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-12 relative z-10 animate-reveal-up">
        {loading ? (
          <div className="text-center py-32 tech-border clip-angled bg-dark-900/80 backdrop-blur-md relative overflow-hidden max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <span className="w-16 h-16 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin inline-block mb-6 shadow-[0_0_20px_rgba(66,133,244,0.5)]"></span>
            <div className="font-mono text-[10px] text-gdg-blue tracking-[0.4em] uppercase drop-shadow-[0_0_10px_rgba(66,133,244,0.8)] font-bold animate-holo-flicker">Establishing connection to mainframe...</div>
          </div>
        ) : (
          <>
            {/* Top 3 podium - Geometric style */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-4 md:gap-8 mb-24 mt-10">
                {/* 2nd - Yellow */}
                <div className="flex flex-col items-center group relative animate-reveal-up" style={{ animationDelay: '0.2s' }}>
                  <div className="absolute top-[-40px] opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] text-gdg-yellow tracking-[0.4em] bg-gdg-yellow/10 px-4 py-1.5 border border-gdg-yellow/30 clip-angled-br">NODE_02</div>
                  <div className="font-display font-black text-4xl mb-6 text-gdg-yellow drop-shadow-[0_0_15px_rgba(251,188,5,0.6)]">02</div>
                  <div className="clip-angled-tl bg-gdg-yellow/5 border-t border-l border-r border-gdg-yellow/50 px-4 py-3 text-center h-32 flex flex-col justify-end w-28 md:w-44 relative shadow-[0_-10px_30px_rgba(251,188,5,0.15)] backdrop-blur-md transition-all group-hover:bg-gdg-yellow/10">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gdg-yellow/20 to-transparent" />
                    <div className="absolute top-0 right-0 w-8 h-[1px] bg-gdg-yellow"></div>
                    <div className="font-display font-black text-sm md:text-base text-white truncate z-10">{leaderboard[1]?.teamName}</div>
                    <div className="font-mono text-[10px] text-gdg-yellow font-bold tracking-[0.3em] mt-2 z-10 bg-dark-950 px-3 py-1 mx-auto border border-white/10 uppercase clip-hex">{leaderboard[1]?.scores.total} CYC</div>
                  </div>
                </div>
                
                {/* 1st - Blue */}
                <div className="flex flex-col items-center group relative z-20 animate-reveal-up" style={{ animationDelay: '0.1s' }}>
                  <div className="absolute top-[-50px] font-mono text-[10px] text-gdg-blue tracking-[0.4em] bg-gdg-blue/10 px-6 py-2 border border-gdg-blue/50 shadow-[0_0_20px_rgba(66,133,244,0.3)] clip-hex">APEX_NODE</div>
                  <div className="font-display font-black text-6xl mb-6 text-gdg-blue animate-pulse drop-shadow-[0_0_30px_rgba(66,133,244,0.8)]">01</div>
                  <div className="clip-angled bg-gdg-blue/10 border-t-2 border-l border-r border-gdg-blue/50 px-6 py-4 text-center h-48 flex flex-col justify-end w-36 md:w-56 shadow-[0_-10px_50px_rgba(66,133,244,0.25)] relative backdrop-blur-md transition-all group-hover:bg-gdg-blue/20">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-gdg-blue/30 to-transparent animate-pulse" />
                    <div className="absolute top-4 left-4 w-12 h-[2px] bg-gdg-blue"></div>
                    <div className="absolute top-4 left-4 w-[2px] h-12 bg-gdg-blue"></div>
                    <div className="font-display font-black text-lg md:text-xl text-white truncate z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{leaderboard[0]?.teamName}</div>
                    <div className="font-mono text-sm md:text-base text-white font-black tracking-[0.3em] mt-3 z-10 bg-gdg-blue px-6 py-1 mx-auto shadow-[0_0_15px_#4285F4] uppercase clip-hex">{leaderboard[0]?.scores.total} CYC</div>
                  </div>
                </div>
                
                {/* 3rd - Green */}
                <div className="flex flex-col items-center group relative animate-reveal-up" style={{ animationDelay: '0.3s' }}>
                  <div className="absolute top-[-40px] opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] text-gdg-green tracking-[0.4em] bg-gdg-green/10 px-4 py-1.5 border border-gdg-green/30 clip-angled-br">NODE_03</div>
                  <div className="font-display font-black text-3xl mb-6 text-gdg-green drop-shadow-[0_0_15px_rgba(52,168,83,0.6)]">03</div>
                  <div className="clip-angled-br bg-gdg-green/5 border-t border-l border-r border-gdg-green/50 px-4 py-3 text-center h-24 flex flex-col justify-end w-28 md:w-44 relative shadow-[0_-10px_30px_rgba(52,168,83,0.15)] backdrop-blur-sm transition-all group-hover:bg-gdg-green/10">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gdg-green/20 to-transparent" />
                    <div className="absolute top-0 left-0 w-8 h-[1px] bg-gdg-green"></div>
                    <div className="font-display font-black text-xs md:text-sm text-white truncate z-10">{leaderboard[2]?.teamName}</div>
                    <div className="font-mono text-[10px] text-gdg-green font-bold tracking-[0.3em] mt-2 z-10 bg-dark-950 px-3 py-1 mx-auto border border-white/10 uppercase clip-hex">{leaderboard[2]?.scores.total} CYC</div>
                  </div>
                </div>
              </div>
            )}

            {/* Full table headers - Geometric style */}
            {leaderboard.length > 0 && (
              <div className="grid grid-cols-12 gap-4 px-8 py-5 font-mono text-[10px] text-gray-500 tracking-[0.4em] border-b border-white/20 mb-6 clip-angled bg-dark-900/80 sticky top-[98px] z-30 shadow-[0_10px_30px_rgba(0,0,0,0.6)] uppercase">
                <div className="col-span-2 md:col-span-1 text-center">RNK</div>
                <div className="col-span-7 md:col-span-4 pl-4 border-l border-white/10">NODE_ID</div>
                <div className="col-span-3 hidden md:block text-center border-l border-white/10">OPERATORS</div>
                <div className="col-span-1 hidden lg:block text-right text-gdg-blue font-bold border-l border-white/10">P1</div>
                <div className="col-span-1 hidden lg:block text-right text-gdg-yellow font-bold border-l border-white/10">P2</div>
                <div className="col-span-1 hidden lg:block text-right text-gdg-red font-bold border-l border-white/10">P3</div>
                <div className="col-span-3 md:col-span-2 lg:col-span-2 text-right text-white font-bold border-l border-white/10">TOTAL</div>
              </div>
            )}

            {/* Full table body */}
            <div className="space-y-4">
              {leaderboard.map((team, idx) => {
                const pct = (team.scores.total / maxScore) * 100;
                const isTop3 = idx < 3;
                
                let borderColor = 'border-white/10';
                let accentColor = 'bg-white/10';
                let textColor = 'text-gray-500';
                let gradientColor = '#333333';
                let rankDisplay = `#${String(idx + 1).padStart(2, '0')}`;
                
                if (idx === 0) {
                  borderColor = 'border-gdg-blue/50';
                  accentColor = 'bg-gdg-blue';
                  textColor = 'text-gdg-blue';
                  gradientColor = '#4285F4';
                  rankDisplay = '01';
                } else if (idx === 1) {
                  borderColor = 'border-gdg-yellow/50';
                  accentColor = 'bg-gdg-yellow';
                  textColor = 'text-gdg-yellow';
                  gradientColor = '#FBBC05';
                  rankDisplay = '02';
                } else if (idx === 2) {
                  borderColor = 'border-gdg-green/50';
                  accentColor = 'bg-gdg-green';
                  textColor = 'text-gdg-green';
                  gradientColor = '#34A853';
                  rankDisplay = '03';
                }

                return (
                  <div
                    key={team.teamId}
                    className={`relative overflow-hidden clip-angled border transition-all duration-300 hover:-translate-x-2 px-8 py-5 group ${isTop3 ? 'bg-dark-900/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-dark-950/80 hover:bg-dark-900'} ${borderColor}`}
                  >
                    {/* Background progress */}
                    <div
                      className="absolute inset-y-0 left-0 opacity-[0.05] transition-all duration-1000 ease-out group-hover:opacity-[0.1]"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${gradientColor}, transparent)`,
                      }}
                    />
                    
                    {/* Active highlight line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} ${idx === 0 ? 'shadow-[0_0_20px_#4285F4]' : 'group-hover:w-2 transition-all'}`} />

                    <div className="relative grid grid-cols-12 gap-4 items-center">
                      {/* Rank */}
                      <div className="col-span-2 md:col-span-1 flex-shrink-0 text-center">
                        {isTop3 ? (
                          <div className={`font-display font-black text-2xl md:text-3xl ${textColor} drop-shadow-[0_0_15px_currentColor]`}>
                            {rankDisplay}
                          </div>
                        ) : (
                          <div className="font-display font-black text-xl text-gray-600 transition-colors group-hover:text-white">
                            {rankDisplay}
                          </div>
                        )}
                      </div>

                      {/* Team info */}
                      <div className="col-span-7 md:col-span-4 z-10 pl-4 border-l border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`font-display font-bold text-base md:text-lg tracking-widest uppercase ${team.isDisqualified ? 'text-gdg-red line-through' : 'text-white'} truncate`}>
                            {team.teamName}
                          </div>
                          {team.isDisqualified && (
                            <span className="font-mono text-[8px] border border-gdg-red/50 text-gdg-red px-2 py-0.5 bg-gdg-red/10 uppercase tracking-widest hidden sm:inline-block shadow-[0_0_10px_rgba(234,67,53,0.2)]">BANNED</span>
                          )}
                        </div>
                        <div className="font-mono text-[9px] text-gray-500 mt-1 tracking-[0.3em] truncate uppercase group-hover:text-gray-400">
                          ID: {team.teamId}
                        </div>
                      </div>

                      {/* Players */}
                      <div className="col-span-3 hidden md:block z-10 text-center border-l border-white/5">
                        <div className="font-mono text-[9px] text-gray-400 bg-dark-950 inline-block px-4 py-2 border border-white/10 truncate max-w-full uppercase tracking-[0.3em] clip-hex">
                          {team.players.join(' | ')}
                        </div>
                      </div>

                      {/* Round scores */}
                      <div className="col-span-1 hidden lg:flex items-center justify-end border-l border-white/5 font-mono text-sm text-gdg-blue/80 z-10 bg-dark-950/50 py-2 px-3">
                        {team.scores.round1 || 0}
                      </div>
                      <div className="col-span-1 hidden lg:flex items-center justify-end border-l border-white/5 font-mono text-sm text-gdg-yellow/80 z-10 bg-dark-950/50 py-2 px-3">
                        {team.scores.round2 || 0}
                      </div>
                      <div className="col-span-1 hidden lg:flex items-center justify-end border-l border-white/5 font-mono text-sm text-gdg-red/80 z-10 bg-dark-950/50 py-2 px-3">
                        {team.scores.round3 || 0}
                      </div>

                      {/* Total */}
                      <div className="col-span-3 md:col-span-2 lg:col-span-2 text-right flex flex-col items-end justify-center z-10 pl-4 border-l border-white/5">
                        <div className={`font-mono font-black text-2xl md:text-3xl ${
                          idx === 0 ? 'text-gdg-blue drop-shadow-[0_0_20px_rgba(66,133,244,0.5)]' :
                          idx === 1 ? 'text-gdg-yellow drop-shadow-[0_0_15px_rgba(251,188,5,0.3)]' :
                          idx === 2 ? 'text-gdg-green drop-shadow-[0_0_15px_rgba(52,168,83,0.3)]' :
                          'text-white group-hover:text-gdg-blue transition-colors'
                        }`}>
                          {team.scores.total}
                        </div>
                        <div className="font-mono text-[8px] text-gray-500 tracking-[0.4em] uppercase mt-1 bg-dark-950 px-2 py-0.5 border border-white/10">CYC</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-24 tech-border clip-angled bg-dark-900/50 backdrop-blur-sm relative mt-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="text-5xl mb-6 opacity-30 grayscale animate-pulse">📡</div>
                <div className="font-mono text-[10px] text-gray-500 tracking-[0.4em] uppercase bg-dark-950 inline-block px-8 py-3 border border-white/10 clip-hex">SYS_ERR: NO_SIGNAL_DETECTED</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
