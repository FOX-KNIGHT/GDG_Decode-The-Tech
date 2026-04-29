'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Countdown timer ring component
function TimerRing({ seconds, total, color = '#00F0FF' }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, seconds / total));
  const offset = circ * (1 - pct);
  const isUrgent = seconds <= 60;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={isUrgent ? '#FF5E52' : color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <div className="absolute text-center flex flex-col items-center justify-center">
        <div className={`font-display font-black text-2xl ${isUrgent ? 'text-neon-red animate-pulse' : 'text-white'}`}>
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </div>
        <div className="font-mono text-[10px] text-gray-500 tracking-widest mt-1">LEFT</div>
      </div>
    </div>
  );
}

// Question result overlay
function ResultOverlay({ correct, points, correctAnswer, explanation, onNext }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/90 backdrop-blur-md">
      <div className={`max-w-xl w-full mx-6 p-10 text-center border-t-4 glass-panel rounded-[2rem] ${correct ? 'border-neon-green shadow-[0_0_50px_rgba(0,255,102,0.15)]' : 'border-neon-red shadow-[0_0_50px_rgba(255,94,82,0.15)]'}`}>
        <div className={`text-6xl mb-6 ${correct ? 'animate-bounce' : 'animate-pulse'}`}>{correct ? '✅' : '❌'}</div>
        <div className={`font-display font-black text-3xl mb-4 ${correct ? 'text-neon-green drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]' : 'text-neon-red drop-shadow-[0_0_10px_rgba(255,94,82,0.5)]'}`}>
          {correct ? `+${points} CYCLES ACCESSED!` : 'ACCESS DENIED'}
        </div>
        {!correct && (
          <div className="font-body text-xl text-white/80 mb-4 bg-dark-950/50 p-4 border border-white/5 inline-block shadow-inner rounded-xl">
            Valid Signature: <span className="text-neon-cyan font-bold ml-2">{correctAnswer}</span>
          </div>
        )}
        {explanation && (
          <div className="font-body text-base text-gray-400 mb-8 border-t border-white/5 pt-6 mt-2 text-left bg-dark-950/40 p-4 rounded-xl">
            {explanation}
          </div>
        )}
        <button
          onClick={onNext}
          className={`btn-neon ${correct ? 'btn-neon-green' : 'btn-neon-cyan'} w-full py-5 text-lg font-display font-bold tracking-widest rounded-[1.5rem]`}
        >
          INITIALIZE_NEXT_NODE →
        </button>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const { teamId } = useParams();
  const router = useRouter();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [team, setTeam] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(900);
  const [showResult, setShowResult] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);
  const [isDisqualifiedLocal, setIsDisqualifiedLocal] = useState(false);
  const timerRef = useRef(null);
  const hasStartedRef = useRef(false);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch {}
  }, []);

  const triggerDisqualification = useCallback(async (reason = 'Exited fullscreen during active round') => {
    setIsDisqualifiedLocal(true);
    try {
      await fetch(`/api/teams/${teamId}/disqualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisqualified: true, reason }),
      });
    } catch (e) {
      console.error('Failed to disqualify', e);
    }
  }, [teamId]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      if (!inFs && hasStartedRef.current && !allAnswered) {
        // Exited fullscreen while active -> Disqualify!
        triggerDisqualification('Exited fullscreen during active round — anti-cheat violation');
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [allAnswered, triggerDisqualification]);

  // Anti-cheat: prevent tab switching, keyboard shortcuts
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasStartedRef.current && !allAnswered) {
        triggerDisqualification('Switched tabs / minimized browser during active round — anti-cheat violation');
      }
    };
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === 'U') ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [allAnswered, triggerDisqualification]);

  // Load questions and session
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchSessionOnly, 10000);
    return () => clearInterval(interval);
  }, [teamId]);

  // Timer
  useEffect(() => {
    if (!session?.roundEndTime) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(session.roundEndTime) - Date.now()) / 1000));
      setTimeLeft(left);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [session?.roundEndTime]);

  async function fetchData() {
    try {
      const sessionRes = await fetch('/api/game/status');
      const { session } = await sessionRes.json();
      setSession(session);

      const round = session?.currentRound || 1;
      const dur = session?.roundDurations?.[`round${round}`] || 900;
      setTotalTime(dur);

      const qRes = await fetch(`/api/game/questions?teamId=${teamId}&round=${round}`);
      if (!qRes.ok) { setLoading(false); return; }
      const data = await qRes.json();
      
      setQuestions(data.questions || []);
      setTeam(data.team);
      if (data.team?.isDisqualified) {
        setIsDisqualifiedLocal(true);
      }
      
      const firstUnanswered = data.questions?.findIndex(q => !q.isAnswered) ?? 0;
      setCurrentQIdx(firstUnanswered >= 0 ? firstUnanswered : 0);
      setAllAnswered(data.questions?.length > 0 && data.questions?.every(q => q.isAnswered));
      
      hasStartedRef.current = true;
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  async function fetchSessionOnly() {
    const res = await fetch('/api/game/status');
    const { session } = await res.json();
    setSession(session);
  }

  const currentQ = questions[currentQIdx];
  const round = session?.currentRound || 1;
  const isRoundActive = session?.status === `round${round}_active`;

  async function submitAnswer(answer) {
    if (submitting || currentQ?.isAnswered) return;
    setSelectedAnswer(answer);
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, questionId: currentQ._id, answer, round }),
      });
      const data = await res.json();
      setResult(data);
      setShowResult(true);
      
      setQuestions(prev => prev.map((q, i) => i === currentQIdx ? { ...q, isAnswered: true } : q));
    } catch {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    setShowResult(false);
    setSelectedAnswer(null);
    setResult(null);
    setSubmitting(false);
    
    const next = questions.findIndex((q, i) => i > currentQIdx && !q.isAnswered);
    if (next >= 0) {
      setCurrentQIdx(next);
    } else {
      const anyUnanswered = questions.findIndex(q => !q.isAnswered);
      if (anyUnanswered >= 0) {
        setCurrentQIdx(anyUnanswered);
      } else {
        setAllAnswered(true);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#020202] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen"></div>
        <div className="font-display font-bold text-neon-cyan animate-pulse tracking-[0.3em] text-xl z-10 flex items-center gap-4 glass-panel p-8 rounded-[2rem]">
          <span className="w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00F0FF]"></span>
          ESTABLISHING SECURE LINK...
        </div>
      </div>
    );
  }

  if (isDisqualifiedLocal || team?.isDisqualified) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center gap-8 bg-[#020202] overflow-hidden select-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-neon-red/5 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-neon-red/15 blur-[180px] rounded-full pointer-events-none" />

        <div className="text-[7rem] drop-shadow-[0_0_60px_rgba(255,94,82,1)] z-10 animate-bounce">🚫</div>

        <div className="text-center z-10 glass-panel p-12 rounded-[2.5rem] border-2 border-neon-red/60 shadow-[0_20px_100px_rgba(255,94,82,0.3)] max-w-2xl w-full mx-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-neon-red shadow-[0_0_20px_rgba(255,94,82,0.8)]" />
          <div className="font-mono text-[10px] text-neon-red/60 tracking-[0.4em] uppercase mb-4">
            ANTI-CHEAT PROTOCOL ENGAGED
          </div>
          <div className="font-display font-black text-neon-red text-4xl md:text-5xl tracking-widest uppercase mb-6 drop-shadow-[0_0_15px_rgba(255,94,82,0.7)]">
            TEAM BANNED
          </div>
          <div className="text-sm md:text-base font-mono text-gray-300 leading-relaxed mb-8">
            {team?.disqualifiedReason || 'Security violation detected — fullscreen was exited during active round.'}
          </div>
          <div className="bg-neon-red/10 border border-neon-red/40 rounded-2xl px-6 py-5 font-mono text-sm text-neon-red/80 tracking-wider">
            ⛔ Your team has been <span className="text-neon-red font-bold">permanently locked out</span> of this session.
            <span className="text-gray-400 text-xs mt-2 block">A tournament administrator must unban your team to restore access.</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center text-center p-8 bg-[#020202] font-body overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen"></div>
        <div className="cyber-grid absolute inset-0 pointer-events-none"></div>
        <div className="scanline" />
        <div className="ambient-orb orb-red opacity-20" />
        
        <div className="text-6xl mb-8 z-10">🔒</div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-6 tracking-wider drop-shadow-lg z-10">STRICT COMPLIANCE REQUIRED</h1>
        <p className="font-body text-xl text-gray-400 max-w-2xl mb-12 glass-panel p-8 rounded-[2rem] border-neon-red/30 z-10 shadow-[0_0_30px_rgba(255,94,82,0.1)]">
          The arena runs in fullscreen-only mode for anti-cheat protection.
          <span className="text-neon-red font-bold block mt-4">WARNING: Exiting fullscreen or switching tabs will result in IMMEDIATE DISQUALIFICATION.</span>
        </p>
        <button onClick={enterFullscreen} className="btn-neon btn-neon-cyan px-16 py-6 text-xl font-display font-black tracking-widest rounded-full z-10 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          🚀 ENTER SECURE ARENA
        </button>
      </div>
    );
  }

  const roundColorMap = {
    1: 'neon-cyan',
    2: 'neon-yellow',
    3: 'neon-magenta'
  };
  const currentRoundColor = roundColorMap[round] || 'neon-cyan';
  const currentHexColor = round === 1 ? '#00F0FF' : round === 2 ? '#FFC933' : '#FF007F';

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col select-none font-body overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none"></div>
      <div className="cyber-grid absolute inset-0 pointer-events-none"></div>
      <div className="scanline" />
      
      {showResult && result && (
        <ResultOverlay
          correct={result.correct}
          points={result.points}
          correctAnswer={result.correctAnswer}
          explanation={result.explanation}
          onNext={nextQuestion}
        />
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-center justify-between px-8 py-5 border-b border-white/10 bg-dark-950/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20 relative gap-4">
        <div className="text-center md:text-left">
          <div className="font-display font-black text-xl text-white tracking-[0.2em]">{team?.teamName}</div>
          <div className="font-mono text-[10px] text-gray-500 tracking-widest mt-1">
            AUTHORIZED_OPERATOR: <span className={`text-${currentRoundColor} font-bold drop-shadow-[0_0_5px_currentColor]`}>{team?.players[team?.currentPlayerIndex]?.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 font-mono text-sm bg-dark-900 border border-white/5 px-6 py-2 rounded-full shadow-inner">
          <span className="text-gray-500">PHASE</span>
          <span className={`text-${currentRoundColor} font-black text-lg drop-shadow-[0_0_8px_currentColor]`}>0{round}</span>
          <span className="text-gray-600">/</span>
          <span className="text-gray-500">03</span>
        </div>

        <div className="text-center md:text-right">
          <div className="font-display font-black text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{result?.totalScore ?? team?.scores?.total ?? 0}</div>
          <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">TOTAL_CYCLES</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-dark-950 relative z-20 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-cyan via-neon-green to-neon-yellow transition-all duration-500 ease-out shadow-[0_0_15px_rgba(0,240,255,0.5)]"
          style={{ width: `${(questions.filter(q => q.isAnswered).length / Math.max(questions.length, 1)) * 100}%` }}
        />
      </div>

      {/* Main content */}
      {!isRoundActive ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
          <div className="text-6xl mb-8 animate-float drop-shadow-2xl">⏳</div>
          <div className="font-display font-black text-3xl md:text-5xl text-white mb-6 tracking-wider">
            {session?.status === 'waiting' ? 'AWAITING_ROOT_AUTHORIZATION...' :
             session?.status === 'finished' ? '🏆 SIMULATION_COMPLETE' :
             'PHASE_SUSPENDED — STAND_BY'}
          </div>
          <div className="font-mono text-sm text-gray-500 tracking-widest glass-panel px-8 py-4 rounded-[1.5rem]">Maintain active connection.</div>
          {session?.status === 'finished' && (
            <button onClick={() => router.push(`/team/${teamId}`)} className="mt-8 btn-neon btn-neon-cyan px-10 py-5 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)]">RETURN_TO_DASHBOARD</button>
          )}
        </div>
      ) : allAnswered ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
          <div className="text-7xl mb-8 animate-bounce">🎉</div>
          <div className="font-display font-black text-5xl text-neon-green mb-6 drop-shadow-[0_0_20px_rgba(0,255,102,0.4)] tracking-widest">PHASE_CONCLUDED</div>
          <div className="font-body text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">All active queries processed successfully. Telemetry stored.</div>
          
          <div className="glass-panel p-10 text-center border-neon-cyan/30 rounded-[2rem] w-full max-w-md mb-8 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
            <div className="font-mono text-[10px] text-gray-400 mb-4 tracking-[0.3em]">ACQUIRED_CYCLES_PHASE_0{round}</div>
            <div className="font-display font-black text-6xl text-neon-cyan drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]">{team?.scores?.[`round${round}`] || 0}</div>
          </div>

          <button onClick={() => router.push(`/team/${teamId}`)} className="btn-neon btn-neon-magenta px-12 py-5 text-lg font-bold tracking-widest rounded-[1.5rem] shadow-[0_0_20px_rgba(255,0,127,0.3)]">
            RETURN_TO_DASHBOARD
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-0 relative z-10 overflow-hidden">
          {/* Left panel: question + options */}
          <div className="flex-1 p-6 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Q counter + nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
              <div className="font-mono text-sm text-gray-500 font-bold tracking-[0.2em] glass-panel px-4 py-2 rounded-lg inline-flex max-w-max border-white/5">
                NODE_INDEX {currentQIdx + 1} <span className="text-gray-700 mx-2">/</span> {questions.length}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => !showResult && setCurrentQIdx(i)}
                    className={`w-10 h-10 rounded-xl flex-shrink-0 text-[11px] font-display transition-all flex items-center justify-center ${
                      q.isAnswered ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' :
                      i === currentQIdx ? `bg-${currentRoundColor}/20 text-white border border-${currentRoundColor} shadow-[0_0_15px_rgba(var(--${currentRoundColor}),0.3)]` :
                      'bg-dark-950 text-gray-600 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Round label */}
            <div className={`inline-flex items-center gap-3 mb-8 font-mono text-xs tracking-[0.2em] font-bold bg-dark-950 px-5 py-2.5 rounded-full border border-${currentRoundColor}/30 w-max text-${currentRoundColor} shadow-inner`}>
              <span className={`w-2 h-2 rounded-full bg-${currentRoundColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
              {round === 1 ? 'DECODE_THE_JARGON' : round === 2 ? 'EMOJI_PATTERN_ANALYSIS' : 'REVERSE_LOGIC_GATE'}
            </div>

            {/* Question */}
            {currentQ && (
              <div className="max-w-4xl">
                {/* Emoji clue (Round 2) */}
                {round === 2 && currentQ.emojiClue && (
                  <div className="text-6xl text-center mb-8 p-10 glass-panel border-neon-yellow/30 rounded-[2rem] animate-float shadow-[0_0_30px_rgba(255,201,51,0.05)]">
                    {currentQ.emojiClue}
                  </div>
                )}

                <div className={`p-8 md:p-10 mb-10 flex-shrink-0 glass-panel border-l-4 rounded-r-[2rem] rounded-bl-[2rem] border-l-${currentRoundColor} shadow-xl relative overflow-hidden`}>
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${currentRoundColor}/10 rounded-full blur-[40px] pointer-events-none`} />
                  <p className="font-body text-2xl md:text-3xl text-white leading-relaxed tracking-wide drop-shadow-md relative z-10">
                    {currentQ.question}
                  </p>
                </div>

                {/* Round 3 instruction */}
                {round === 3 && !currentQ.isAnswered && (
                  <div className="mb-8 font-mono text-xs md:text-sm text-neon-red font-bold border border-neon-red/50 bg-neon-red/10 p-5 rounded-[1.5rem] animate-pulse flex items-start md:items-center gap-4 shadow-[inset_0_0_20px_rgba(255,94,82,0.1)]">
                    <span className="text-2xl drop-shadow-[0_0_10px_currentColor]">⚠️</span>
                    CRITICAL OVERRIDE: CHOOSE THE OPPOSITE OF THE CORRECT FACT TO PROCEED.
                  </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                  {currentQ.options?.map((opt, i) => {
                    const letter = ['A', 'B', 'C', 'D'][i];
                    const isSelected = selectedAnswer === opt;
                    const isAnswered = currentQ.isAnswered;
                    return (
                      <button
                         key={i}
                         onClick={() => !isAnswered && !showResult && submitAnswer(opt)}
                         disabled={isAnswered || showResult}
                         className={`text-left p-6 font-display font-bold tracking-wider text-lg transition-all duration-300 relative overflow-hidden group rounded-[1.5rem] ${
                           isSelected 
                             ? `bg-${currentRoundColor} text-black shadow-[0_0_20px_rgba(var(--${currentRoundColor}),0.4)] scale-[1.02]` 
                             : isAnswered 
                               ? 'bg-dark-950 text-gray-600 cursor-not-allowed opacity-50 border border-white/5' 
                               : `glass-panel text-gray-300 border border-white/5 hover:border-${currentRoundColor}/50 hover:bg-${currentRoundColor}/5 hover:-translate-y-1`
                         }`}
                      >
                         <div className={`absolute top-0 left-0 bottom-0 w-1 ${isSelected ? 'bg-black/20' : 'bg-white/10 group-hover:bg-' + currentRoundColor} transition-colors`} />
                         <span className={`inline-block mr-4 font-mono text-sm opacity-70 ${isSelected ? 'text-black' : `text-${currentRoundColor} group-hover:text-white`}`}>
                           [{letter}]
                         </span>
                         {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: timer + stats */}
          <div className="lg:w-80 p-8 border-t lg:border-t-0 lg:border-l border-white/10 bg-dark-950/80 backdrop-blur-md flex flex-col items-center gap-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <TimerRing seconds={timeLeft} total={totalTime} color={currentHexColor} />
            
            <div className="w-full space-y-4">
              <div className={`glass-panel p-6 text-center border border-white/5 rounded-[1.5rem] hover:border-${currentRoundColor}/30 transition-colors shadow-inner`}>
                <div className="font-mono text-[10px] text-gray-500 mb-2 tracking-[0.2em] uppercase">Phase_Cycles</div>
                <div className={`font-display font-black text-4xl text-${currentRoundColor} drop-shadow-[0_0_15px_currentColor]`}>
                  {team?.scores?.[`round${round}`] || 0}
                </div>
              </div>
              <div className="glass-panel p-6 text-center border border-white/5 rounded-[1.5rem] hover:border-white/20 transition-colors shadow-inner">
                <div className="font-mono text-[10px] text-gray-500 mb-2 tracking-[0.2em] uppercase">Nodes_Processed</div>
                <div className="font-display font-black text-3xl text-white">
                  {questions.filter(q => q.isAnswered).length} <span className="text-gray-600 text-xl">/ {questions.length}</span>
                </div>
              </div>
            </div>

            <div className="w-full text-center mt-auto pb-4 pt-8 border-t border-white/5">
              <div className="w-12 h-12 mx-auto mb-4 text-3xl glass-panel rounded-2xl flex items-center justify-center shadow-inner border border-white/5">{['🧠', '⚡', '🎯'][team?.currentPlayerIndex || 0]}</div>
              <div className="font-mono text-[10px] text-gray-500 mb-1 tracking-[0.3em] uppercase">Active_Operator</div>
              <div className={`font-display font-bold text-lg text-${currentRoundColor} tracking-wider truncate uppercase drop-shadow-[0_0_8px_currentColor]`}>
                {team?.players?.[team?.currentPlayerIndex]?.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
