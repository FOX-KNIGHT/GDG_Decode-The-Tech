'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Cpu, Activity, Clock, Target, AlertTriangle, Lock, Unlock, ArrowRight, CheckCircle2, XCircle, Crosshair, Hexagon, Radar, Pause, Send } from 'lucide-react';

// --- Cyberpunk Scramble Text ---
const ScrambleText = ({ text, duration = 1200, className }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      let newText = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          newText += ' ';
          continue;
        }
        if (Math.random() < percentage) {
          newText += text[i];
        } else {
          newText += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      setDisplayText(newText);
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [text, duration]);
  
  return <span className={className}>{displayText}</span>;
};

// --- Match the Following Component ---
function MatchInterface({ data, onComplete, isSubmitting, accentColor }) {
  const [pairs, setPairs] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);

  const handleLeftClick = (item) => {
    if (isSubmitting) return;
    setSelectedLeft(item);
  };

  const handleRightClick = (item) => {
    if (isSubmitting || !selectedLeft) return;
    
    // Remove existing pair with this left or right
    const filtered = pairs.filter(p => p.left !== selectedLeft && p.right !== item);
    setPairs([...filtered, { left: selectedLeft, right: item }]);
    setSelectedLeft(null);
  };

  const isPaired = (side, item) => pairs.some(p => p[side] === item);
  const getPairedWith = (side, item) => {
    const p = pairs.find(pair => pair[side] === item);
    return side === 'left' ? p?.right : p?.left;
  };

  const allPaired = pairs.length === data.left.length;

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="w-full max-h-[50vh] md:max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-5xl mx-auto">
          {/* Left Column */}
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[9px] text-white/20 tracking-[0.4em] uppercase mb-1 ml-4 text-center md:text-left">Terminal_A (Source)</div>
            {data.left.map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 5 }}
                onClick={() => handleLeftClick(item)}
                className={`relative p-4 md:p-5 text-left border-l-4 transition-all duration-300 clip-slant ${
                  selectedLeft === item 
                    ? 'bg-white/20 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] z-10' 
                    : isPaired('left', item)
                      ? 'bg-black/20 border-white/20 text-white/60'
                      : 'bg-black/40 border-white/5 text-white/40 hover:text-white hover:border-white/20'
                }`}
                style={{ borderLeftColor: selectedLeft === item ? accentColor : isPaired('left', item) ? accentColor : undefined }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-xs md:text-sm font-bold tracking-wider uppercase truncate">{item}</span>
                  {isPaired('left', item) && <CheckCircle2 size={14} className="text-white/40 shrink-0" />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[9px] text-white/20 tracking-[0.4em] uppercase mb-1 ml-4 text-center md:text-right">Terminal_B (Destination)</div>
            {data.right.map((item, i) => {
              const pairedLeft = getPairedWith('right', item);
              return (
                <motion.button
                  key={i}
                  whileHover={{ x: -5 }}
                  onClick={() => handleRightClick(item)}
                  className={`relative p-4 md:p-5 text-right border-r-4 transition-all duration-300 clip-slant ${
                    isPaired('right', item)
                      ? 'bg-white/5 border-white text-white'
                      : 'bg-black/40 border-white/5 text-white/40 hover:text-white hover:border-white/20'
                  }`}
                  style={{ borderRightColor: isPaired('right', item) ? accentColor : undefined }}
                >
                  <div className="flex items-center justify-between flex-row-reverse gap-4">
                    <span className="font-body text-xs md:text-sm font-bold tracking-wider uppercase text-right leading-tight">{item}</span>
                    {pairedLeft && (
                      <div className="font-mono text-[8px] uppercase tracking-tighter text-white/30 truncate max-w-[120px] bg-white/5 px-2 py-1 rounded">
                        Linked: {pairedLeft}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: allPaired ? 1 : 0.3, y: 0, scale: allPaired ? 1 : 0.98 }}
        disabled={!allPaired || isSubmitting}
        onClick={() => onComplete(pairs)}
        className="group relative flex items-center gap-3 px-10 py-4 bg-white text-black font-display font-black tracking-[0.3em] uppercase clip-slant transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] mt-2"
        style={{ backgroundColor: allPaired ? accentColor : 'rgba(255,255,255,0.1)', color: allPaired ? 'black' : 'rgba(255,255,255,0.2)' }}
      >
        <Send size={16} />
        Initialize Uplink
      </motion.button>
    </div>
  );
}

export default function PlayClient({ initialQuestions, initialTeam, initialSession }) {
  const { teamId } = useParams();
  const router = useRouter();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions || []);
  const firstUnanswered = initialQuestions?.findIndex(q => !q.isAnswered) ?? 0;
  const [currentQIdx, setCurrentQIdx] = useState(firstUnanswered >= 0 ? firstUnanswered : 0);
  const [team, setTeam] = useState(initialTeam);
  const [session, setSession] = useState(initialSession);
  const [allAnswered, setAllAnswered] = useState(initialQuestions?.length > 0 && initialQuestions?.every(q => q.isAnswered));
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (initialSession?.roundEndTime) {
      const left = Math.max(0, Math.floor((new Date(initialSession.roundEndTime) - Date.now()) / 1000));
      return left;
    }
    return 0;
  });
  const [totalTime, setTotalTime] = useState(initialSession?.roundDurations?.[`round${initialSession?.currentRound || 1}`] || 900);
  const [isDisqualifiedLocal, setIsDisqualifiedLocal] = useState(initialTeam?.isDisqualified || false);
  const timerRef = useRef(null);
  const hasStartedRef = useRef(true);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (e) {
      console.error("Fullscreen failed", e);
    }
  }, []);

  const triggerDisqualification = useCallback(async (reason = 'Exited fullscreen during active phase') => {
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

  useEffect(() => {
    const handler = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      if (!inFs && hasStartedRef.current && !allAnswered) {
        triggerDisqualification('Exited fullscreen during active phase — anti-cheat protocol triggered.');
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [allAnswered, triggerDisqualification]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasStartedRef.current && !allAnswered) {
        triggerDisqualification('Background navigation detected during active phase.');
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchSessionOnly, 10000);
    return () => clearInterval(interval);
  }, [teamId]);

  useEffect(() => {
    // Force redirect to dashboard if the round is not active or time is up
    const isActuallyActive = session?.status === `round${session?.currentRound || 1}_active`;
    const isTimeOver = timeLeft === 0 && session?.roundEndTime && (new Date(session.roundEndTime) <= new Date());
    
    if (!isActuallyActive || isTimeOver) {
      router.push(`/team/${teamId}`);
    }
  }, [session?.status, timeLeft, router, teamId, session?.roundEndTime, session?.currentRound]);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!session?.roundEndTime) return;
    if (session?.isPaused && session?.timeRemainingAtPause != null) {
      setTimeLeft(Math.floor(session.timeRemainingAtPause / 1000));
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(session.roundEndTime) - Date.now()) / 1000));
      setTimeLeft(left);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [session?.roundEndTime, session?.isPaused, session?.timeRemainingAtPause]);

  async function fetchData() {
    try {
      const sessionRes = await fetch('/api/game/status');
      const { session } = await sessionRes.json();
      setSession(session);

      const round = session?.currentRound || 1;
      const dur = session?.roundDurations?.[`round${round}`] || 900;
      setTotalTime(dur);

      const qRes = await fetch(`/api/game/questions?teamId=${teamId}&round=${round}`);
      if (!qRes.ok) return;
      const data = await qRes.json();
      
      setQuestions(data.questions || []);
      setTeam(data.team);
      if (data.team?.isDisqualified) setIsDisqualifiedLocal(true);
      
      setAllAnswered(data.questions?.length > 0 && data.questions?.every(q => q.isAnswered));
    } catch {}
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
      
      const updatedQuestions = questions.map((q, i) => i === currentQIdx ? { ...q, isAnswered: true } : q);
      setQuestions(updatedQuestions);
      
      if (data.totalScore !== undefined) {
        setTeam(prev => {
          if (!prev) return prev;
          const newScores = { ...prev.scores };
          if (data.points) newScores[`round${round}`] = (newScores[`round${round}`] || 0) + data.points;
          newScores.total = data.totalScore;
          return { ...prev, scores: newScores };
        });
      }

      // No result overlay - move to next question instantly
      nextQuestion(updatedQuestions);
    } catch {
      setSubmitting(false);
    }
  }

  function nextQuestion(updatedQuestions = questions) {
    setSelectedAnswer(null);
    setSubmitting(false);
    
    const next = updatedQuestions.findIndex((q, i) => i > currentQIdx && !q.isAnswered);
    if (next >= 0) {
      setCurrentQIdx(next);
    } else {
      const anyUnanswered = updatedQuestions.findIndex(q => !q.isAnswered);
      if (anyUnanswered >= 0) {
        setCurrentQIdx(anyUnanswered);
      } else {
        setAllAnswered(true);
      }
    }
  }

  // Remove early return for disqualified teams - they can now play but with a warning banner

  if (team?.isEliminated || isDisqualifiedLocal || team?.isDisqualified) {
    const isDQ = isDisqualifiedLocal || team?.isDisqualified;
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#020205] overflow-hidden select-none font-body">
        <div className="absolute inset-0 bg-red-950/20 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center max-w-3xl w-full mx-6 text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            {isDQ ? <ShieldAlert size={48} className="text-red-500" /> : <XCircle size={48} className="text-red-500" />}
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-6 tracking-[0.1em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            {isDQ ? 'ACCESS REVOKED' : 'PHASE TERMINATED'}
          </h1>
          <div className="bg-black/60 border border-red-500/20 p-8 rounded-3xl backdrop-blur-3xl mb-10 w-full">
            <p className="text-xl md:text-2xl text-red-500/80 font-mono tracking-widest mb-4 uppercase">
              {isDQ ? 'Anti-Cheat Protocol Triggered' : 'Qualification Protocol Failed'}
            </p>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              {isDQ 
                ? 'Your connection has been severed due to a security violation (exiting full-screen or background navigation). This unit is no longer authorized to attend questions.'
                : `Your team failed to meet the cycle threshold for Phase 0${team?.eliminatedAtRound || 1}. Access to subsequent levels has been revoked.`}
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/team/${teamId}`)} 
              className="px-10 py-4 bg-red-500/10 border border-red-500/50 text-red-500 font-display font-bold uppercase tracking-[0.3em] clip-slant hover:bg-red-500 hover:text-white transition-all"
            >
              Return to Terminal
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentHexColor = round === 1 ? '#00F0FF' : round === 2 ? '#FFC933' : '#FF007F';
  const timePct = totalTime > 0 ? timeLeft / totalTime : 0;
  const isUrgent = timeLeft <= 60 && timeLeft > 0;

  if (!isFullscreen) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center text-center p-6 bg-[#020205] overflow-hidden font-body">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
           <div className="w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] rounded-full border border-[#00F0FF]/20 animate-[spin_40s_linear_infinite]" style={{ transform: 'rotateX(60deg)' }} />
           <div className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full border-2 border-[#00F0FF]/10 border-dashed animate-[spin_20s_linear_infinite_reverse]" style={{ transform: 'rotateX(60deg)' }} />
        </div>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="z-10 flex flex-col items-center max-w-3xl relative w-full">
          <div className="absolute -inset-20 bg-[#00F0FF]/5 blur-[100px] rounded-full animate-pulse pointer-events-none" />
          <Lock size={64} strokeWidth={1} className="text-[#00F0FF] mb-10 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]" />
          <div className="border border-[#00F0FF]/30 bg-black/80 backdrop-blur-3xl p-12 md:p-20 w-full shadow-[0_0_100px_rgba(0,240,255,0.1),inset_0_0_30px_rgba(0,240,255,0.05)] clip-angled-lg relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />
            <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-6 tracking-[0.2em] uppercase">Secure Terminal</h1>
            <p className="text-lg md:text-xl text-[#00F0FF]/70 font-mono tracking-widest mb-12 uppercase">Focal Control Validation Required</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={enterFullscreen} className="relative group w-full py-6 flex items-center justify-center gap-4 bg-[#00F0FF]/10 border border-[#00F0FF]/50 text-[#00F0FF] font-display font-black text-xl md:text-2xl tracking-[0.3em] uppercase overflow-hidden transition-all shadow-[inset_0_0_20px_rgba(0,240,255,0.2)] hover:bg-[#00F0FF] hover:text-black clip-slant">
              <Unlock size={24} className="relative z-10" />
              <span className="relative z-10">Grant Access</span>
            </motion.button>
            <div className="mt-10 bg-red-500/10 border-l-4 border-red-500 p-6 text-left">
               <span className="text-red-500 font-bold flex items-center gap-3 text-sm uppercase tracking-widest mb-2"><AlertTriangle size={18}/> Warning</span>
               <p className="text-white/50 font-mono text-xs uppercase tracking-wider leading-relaxed">Exiting full screen during an active phase will trigger an immediate anti-cheat disqualification.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white overflow-hidden relative font-body selection:bg-[#00F0FF]/30 flex flex-col" onContextMenu={e => e.preventDefault()}>
      <style dangerouslySetInnerHTML={{__html: `
        .clip-angled-lg { clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px); }
        .clip-slant { clip-path: polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%); }
        .clip-hex { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
      `}} />

      {/* HUD & Background stays the same */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,${currentHexColor}15_0%,rgba(0,0,0,1)_80%)] opacity-90 transition-colors duration-1000`} />
         <div className="absolute bottom-[-20%] left-[-50%] w-[200%] h-[100%] [transform:perspective(600px)_rotateX(70deg)] opacity-20 mix-blend-screen" style={{ backgroundImage: `linear-gradient(to right, ${currentHexColor} 1px, transparent 1px), linear-gradient(to bottom, ${currentHexColor} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
         <div className="absolute top-0 left-0 w-full h-[2px] opacity-30 animate-[scan_5s_linear_infinite]" style={{ backgroundColor: currentHexColor, boxShadow: `0 0 20px ${currentHexColor}` }} />
      </div>

      {/* Disqualification Banner */}
      {(isDisqualifiedLocal || team?.isDisqualified) && (
        <div className="relative z-[100] w-full bg-red-600/90 backdrop-blur-md border-b border-red-400/50 py-2 px-6 flex items-center justify-center gap-4 shadow-[0_5px_20px_rgba(220,38,38,0.5)]">
          <ShieldAlert size={18} className="text-white animate-pulse" />
          <span className="font-display font-black text-[10px] md:text-xs tracking-[0.3em] text-white uppercase">
            Anti-Cheat Protocol Triggered: Team Disqualified. Observations only — cycles will not be recorded.
          </span>
        </div>
      )}

      <div className="relative z-40 w-full bg-[#000]/60 backdrop-blur-2xl border-b border-white/10 flex flex-col">
        <div className="w-full h-1 bg-white/10 relative overflow-hidden">
           <motion.div className="absolute top-0 left-0 h-full" style={{ width: `${timePct * 100}%`, backgroundColor: isUrgent ? '#FF003C' : currentHexColor, transition: 'width 1s linear', boxShadow: `0 0 15px ${isUrgent ? '#FF003C' : currentHexColor}` }} />
        </div>
        <div className="flex items-center justify-between px-6 md:px-12 py-5">
           <div className="flex items-center gap-4">
              <img src="/gdg-logo.png" alt="GDG" className="w-8 h-8 object-contain mr-4 hidden md:block" />

              <div className="flex flex-col">
                 <span className="font-mono text-[10px] text-white/50 tracking-[0.5em] uppercase">Active Operator</span>
                 <span className="font-display font-black text-lg text-white uppercase">
                   {team?.players?.[(team?.currentPlayerIndex ?? 0)]?.name || 'OPERATOR'}
                 </span>
              </div>
           </div>
           <div className={`hidden md:flex items-center gap-4 font-display font-black text-3xl tracking-[0.2em] ${isUrgent ? 'text-[#FF003C] animate-pulse' : 'text-white'}`}>
              <Clock size={24} className="text-white/30" />
              {Math.floor(timeLeft / 60)}<span className="text-white/30 mx-1">:</span>{String(timeLeft % 60).padStart(2, '0')}
           </div>
           <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                 <span className="font-mono text-[10px] text-white/50 tracking-[0.5em] uppercase">Cycles</span>
                 <span className="font-display font-black text-2xl md:text-3xl text-white">{team?.scores?.[`round${round}`] || 0}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="relative flex-1 w-full flex flex-col items-center justify-center px-6 md:px-12 py-8 z-20">
         <div className="w-full max-w-6xl flex flex-col items-center justify-center h-full">
            {!isRoundActive ? (
               <div className="bg-[#000]/40 border border-white/10 rounded-[30px] p-12 backdrop-blur-3xl text-center max-w-xl w-full">
                 <Radar className="w-14 h-14 mx-auto mb-6 animate-spin" style={{ color: currentHexColor }} />
                 <h2 className="font-display font-light text-3xl text-white mb-4 uppercase">
                   <ScrambleText text={session?.status === 'waiting' ? 'Awaiting Uplink' : 'System Suspended'} duration={1200} />
                 </h2>
               </div>
            ) : allAnswered ? (
               <div className="bg-[#000]/40 border border-[#00FF66]/20 rounded-[30px] p-12 backdrop-blur-3xl text-center max-w-xl w-full">
                 <CheckCircle2 className="w-14 h-14 mx-auto mb-6 text-[#00FF66]" />
                 <h2 className="font-display font-light text-4xl text-[#00FF66] mb-4 uppercase">Phase Secured</h2>
                 <button onClick={() => router.push(`/team/${teamId}`)} className="mt-8 px-10 py-4 border border-[#00FF66]/40 text-[#00FF66] font-mono text-xs tracking-[0.2em] uppercase rounded-full">Dashboard</button>
               </div>
            ) : (
               <AnimatePresence mode="wait">
                 {currentQ && (
                   <motion.div 
                     key={currentQ._id}
                     initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                     className="w-full h-full flex flex-col items-center"
                   >
                      {/* Progress Bar */}
                      <div className="w-full max-w-3xl mb-12">
                        <div className="flex items-center justify-between mb-4 px-2">
                           <div className="flex flex-col">
                              <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.4em]">Mission Progress</span>
                              <span className="font-display font-black text-2xl text-white tracking-widest">
                                 {questions.filter(q => q.isAnswered).length} / {questions.length}
                                 <span className="text-[10px] text-white/30 ml-3 font-mono tracking-normal uppercase">Nodes Attended</span>
                              </span>
                           </div>
                           <div className="text-right">
                              <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.4em]">Completion</span>
                              <div className="font-display font-black text-2xl text-white tracking-widest">
                                 {Math.round((questions.filter(q => q.isAnswered).length / questions.length) * 100)}%
                              </div>
                           </div>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(questions.filter(q => q.isAnswered).length / questions.length) * 100}%` }}
                              className="h-full rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                              style={{ backgroundColor: currentHexColor }}
                           />
                        </div>
                      </div>

                      <div className="font-mono text-[10px] text-white/50 tracking-[0.8em] uppercase mb-6 flex items-center gap-4 w-full max-w-3xl">
                         <span className="h-[1px] flex-1 opacity-30" style={{ backgroundColor: currentHexColor }} />
                         NODE {currentQIdx + 1} / {questions.length}
                         <span className="h-[1px] flex-1 opacity-30" style={{ backgroundColor: currentHexColor }} />
                      </div>

                     <div className="relative bg-[#000]/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 text-center w-full max-w-3xl clip-angled-lg mb-6">
                        {/* Emoji Clue Display — shown prominently for Round 2 */}
                        {currentQ.emojiClue && (
                          <div className="text-5xl md:text-6xl mb-4 tracking-widest leading-relaxed">
                            {currentQ.emojiClue}
                          </div>
                        )}
                        <h2 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">
                           <ScrambleText text={currentQ.question} duration={1000} />
                        </h2>
                     </div>

                     {currentQ.type === 'match' ? (
                       <MatchInterface 
                         data={currentQ.matchData} 
                         onComplete={submitAnswer} 
                         isSubmitting={submitting} 
                         accentColor={currentHexColor} 
                       />
                     ) : (
                       <div className="w-full flex flex-col items-center gap-6">
                          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQ.options?.map((opt, i) => (
                              <motion.button
                                key={i}
                                onClick={() => !submitting && setSelectedAnswer(opt)}
                                disabled={submitting}
                                className={`p-4 md:p-5 text-left border-l-4 clip-slant bg-black/60 hover:bg-black/80 transition-all ${
                                  selectedAnswer === opt 
                                    ? 'border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                                    : 'border-white/10 hover:border-white/40'
                                }`}
                                style={{ borderLeftColor: selectedAnswer === opt ? currentHexColor : undefined }}
                              >
                                <div className="flex items-center gap-5">
                                  <div className={`w-8 h-8 border flex items-center justify-center font-display font-black clip-hex transition-colors ${
                                    selectedAnswer === opt ? 'bg-white text-black border-white' : 'border-white/20 text-white/40'
                                  }`}>
                                    {['A', 'B', 'C', 'D'][i]}
                                  </div>
                                  <span className={`text-base md:text-lg font-body tracking-wide transition-colors ${selectedAnswer === opt ? 'text-white' : 'text-white/60'}`}>{opt}</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                          
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: selectedAnswer ? 1 : 0, y: selectedAnswer ? 0 : 10 }}
                            disabled={!selectedAnswer || submitting}
                            onClick={() => submitAnswer(selectedAnswer)}
                            className="group relative flex items-center gap-3 px-10 py-4 bg-white text-black font-display font-black tracking-[0.3em] uppercase clip-slant transition-all hover:scale-105 active:scale-95 disabled:opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                            style={{ backgroundColor: currentHexColor }}
                          >
                            <Send size={18} />
                            Transmit Signature
                          </motion.button>
                        </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
            )}
         </div>
      </div>
    </div>
  );
}
