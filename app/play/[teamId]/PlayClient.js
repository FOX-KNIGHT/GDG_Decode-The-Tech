'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Cpu, Activity, Clock, Target, AlertTriangle, Lock, Unlock, ArrowRight, CheckCircle2, XCircle, Crosshair, Hexagon, Radar } from 'lucide-react';

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

// --- Premium Glass Result Overlay ---
function ResultOverlay({ correct, points, correctAnswer, explanation, onNext }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020205]/80 backdrop-blur-3xl overflow-hidden select-none">
      
      {/* Soft Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: correct ? 0.2 : 0.15 }} 
          transition={{ duration: 1.5, ease: "easeOut" }} 
          className="absolute w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[120px]"
          style={{ backgroundColor: correct ? '#00FF66' : '#FF003C' }}
        />
      </div>

      <motion.div 
        initial={{ scale: 0.95, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.95, y: -30, opacity: 0 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 120 }} 
        className="relative z-10 w-full max-w-3xl mx-6 flex flex-col items-center"
      >
        <div className="relative w-full bg-[#000]/40 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-12 text-center shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.02)]">
          
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }} 
            className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 flex items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${correct ? 'text-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.3)]' : 'text-[#FF003C] shadow-[0_0_30px_rgba(255,0,60,0.3)]'}`}
          >
            {correct ? <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} /> : <XCircle className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />}
          </motion.div>
          
          <div className="font-mono text-[10px] md:text-xs tracking-[0.4em] md:tracking-[0.6em] uppercase text-white/40 mb-4 flex items-center justify-center gap-4">
             <div className="w-6 h-[1px] bg-white/20" />
             System Analysis
             <div className="w-6 h-[1px] bg-white/20" />
          </div>
          
          <div className={`font-display font-light text-3xl md:text-5xl tracking-[0.1em] uppercase mb-8 ${correct ? 'text-[#00FF66] drop-shadow-[0_0_15px_currentColor]' : 'text-[#FF003C] drop-shadow-[0_0_15px_currentColor]'}`}>
            <ScrambleText text={correct ? 'ACCESS GRANTED' : 'ACCESS DENIED'} duration={1000} />
          </div>
          
          {correct && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="inline-flex items-center justify-center gap-3 bg-[#00FF66]/5 border border-[#00FF66]/20 rounded-2xl px-8 py-4 mb-8 shadow-[0_0_20px_rgba(0,255,102,0.05)]">
              <Zap size={24} className="text-[#00FF66]" strokeWidth={1.5} />
              <span className="text-white font-display font-light text-2xl tracking-widest">+{points} <span className="text-[#00FF66] text-lg">CYCLES</span></span>
            </motion.div>
          )}
          
          {!correct && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full bg-[#FF003C]/5 border border-[#FF003C]/20 rounded-2xl p-6 md:p-8 mb-8 flex flex-col items-center">
              <div className="font-mono text-[10px] text-[#FF003C]/70 tracking-[0.3em] uppercase mb-3 flex items-center gap-2"><Target size={14} /> Required Signature</div>
              <div className="font-body font-light text-white text-xl md:text-2xl tracking-wide">{correctAnswer}</div>
            </motion.div>
          )}
          
          {explanation && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="w-full text-center mb-8">
              <div className="font-mono text-[10px] text-white/30 tracking-[0.4em] uppercase mb-3 flex items-center justify-center gap-2"><Cpu size={14} /> Telemetry Log</div>
              <div className="font-body text-white/60 text-base leading-relaxed font-light">{explanation}</div>
            </motion.div>
          )}
          
          <motion.button 
             whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }} 
             whileTap={{ scale: 0.98 }} 
             onClick={onNext} 
             className="w-full max-w-[200px] mx-auto flex items-center justify-center gap-3 py-4 rounded-full border border-white/20 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all hover:border-white/50"
          >
            Proceed 
            <ArrowRight className="w-4 h-4 opacity-70" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
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
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(900);
  const [showResult, setShowResult] = useState(false);
  const [isDisqualifiedLocal, setIsDisqualifiedLocal] = useState(initialTeam?.isDisqualified || false);
  const timerRef = useRef(null);
  const hasStartedRef = useRef(true);

  // Instantly enter fullscreen without boot animation
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

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
      setResult(data);
      setShowResult(true);
      
      setQuestions(prev => prev.map((q, i) => i === currentQIdx ? { ...q, isAnswered: true } : q));
      
      if (data.totalScore !== undefined) {
        setTeam(prev => {
          if (!prev) return prev;
          const newScores = { ...prev.scores };
          if (data.points) newScores[`round${round}`] = (newScores[`round${round}`] || 0) + data.points;
          newScores.total = data.totalScore;
          return { ...prev, scores: newScores };
        });
      }
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
    if (next >= 0) setCurrentQIdx(next);
    else {
      const anyUnanswered = questions.findIndex(q => !q.isAnswered);
      if (anyUnanswered >= 0) setCurrentQIdx(anyUnanswered);
      else setAllAnswered(true);
    }
  }



  if (isDisqualifiedLocal || team?.isDisqualified) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#000] overflow-hidden select-none">
        <div className="absolute inset-0 bg-[#FF003C]/10 animate-pulse pointer-events-none" />
        <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,#FF003C_2px,#FF003C_4px)]" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 flex flex-col items-center max-w-4xl w-full mx-6">
          <ShieldAlert size={100} className="text-[#FF003C] mb-10 animate-bounce drop-shadow-[0_0_50px_rgba(255,0,60,1)]" />
          <div className="w-full bg-black/90 p-16 border-2 border-[#FF003C] text-center shadow-[inset_0_0_100px_rgba(255,0,60,0.3),0_0_80px_rgba(255,0,60,0.5)] clip-angled-lg">
             <div className="font-display font-black text-[#FF003C] text-5xl md:text-8xl tracking-[0.1em] uppercase mb-8">
              SYSTEM LOCKDOWN
            </div>
            <div className="text-gray-300 font-mono text-xl max-w-2xl mx-auto border-l-4 border-[#FF003C] bg-[#FF003C]/10 p-6 shadow-inner tracking-widest">
              {team?.disqualifiedReason || 'Unauthorized navigation detected. Anti-cheat protocol triggered.'}
            </div>
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
        {/* Radar Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
           <div className="w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] rounded-full border border-[#00F0FF]/20 animate-[spin_40s_linear_infinite]" style={{ transform: 'rotateX(60deg)' }} />
           <div className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full border-2 border-[#00F0FF]/10 border-dashed animate-[spin_20s_linear_infinite_reverse]" style={{ transform: 'rotateX(60deg)' }} />
        </div>
        
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="z-10 flex flex-col items-center max-w-3xl relative w-full">
          <div className="absolute -inset-20 bg-[#00F0FF]/5 blur-[100px] rounded-full animate-pulse pointer-events-none" />
          
          <Lock size={64} strokeWidth={1} className="text-[#00F0FF] mb-10 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]" />
          
          <div className="border border-[#00F0FF]/30 bg-black/80 backdrop-blur-3xl p-12 md:p-20 w-full shadow-[0_0_100px_rgba(0,240,255,0.1),inset_0_0_30px_rgba(0,240,255,0.05)] clip-angled-lg relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />
            <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-6 tracking-[0.2em] uppercase">
              Secure Terminal
            </h1>
            <p className="text-lg md:text-xl text-[#00F0FF]/70 font-mono tracking-widest mb-12 uppercase">
              Focal Control Validation Required
            </p>
            
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={enterFullscreen} className="relative group w-full py-6 flex items-center justify-center gap-4 bg-[#00F0FF]/10 border border-[#00F0FF]/50 text-[#00F0FF] font-display font-black text-xl md:text-2xl tracking-[0.3em] uppercase overflow-hidden transition-all shadow-[inset_0_0_20px_rgba(0,240,255,0.2)] hover:bg-[#00F0FF] hover:text-black clip-slant">
              <div className="absolute inset-0 bg-current translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out opacity-20" />
              <Unlock size={24} className="relative z-10 transition-colors duration-300" />
              <span className="relative z-10 transition-colors duration-300">Grant Access</span>
            </motion.button>
            
            <div className="mt-10 bg-red-500/10 border-l-4 border-red-500 p-6 text-left">
               <span className="text-red-500 font-bold flex items-center gap-3 text-sm uppercase tracking-widest mb-2">
                 <AlertTriangle size={18}/> Warning
               </span>
               <p className="text-white/50 font-mono text-xs uppercase tracking-wider leading-relaxed">
                 Exiting full screen during an active phase will trigger an immediate anti-cheat disqualification.
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white overflow-hidden relative font-body selection:bg-[#00F0FF]/30 flex flex-col" onContextMenu={e => e.preventDefault()}>
      
      {/* Global CSS for complex geometric clip-paths */}
      <style dangerouslySetInnerHTML={{__html: `
        .clip-angled-lg { clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px); }
        .clip-angled { clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px); }
        .clip-slant { clip-path: polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%); }
        .clip-hex { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
      `}} />

      {/* Extreme Graphical Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
         <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,${currentHexColor}15_0%,rgba(0,0,0,1)_80%)] opacity-90 transition-colors duration-1000`} />
         
         {/* 3D Perspective Grid */}
         <div className="absolute bottom-[-20%] left-[-50%] w-[200%] h-[100%] [transform:perspective(600px)_rotateX(70deg)] opacity-20 mix-blend-screen" style={{ backgroundImage: `linear-gradient(to right, ${currentHexColor} 1px, transparent 1px), linear-gradient(to bottom, ${currentHexColor} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
         
         {/* Vertical Data Streams (Left & Right) */}
         <div className="absolute top-0 left-4 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-50" />
         <div className="absolute top-0 right-4 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-50" />
         
         {/* Scanning Horizontal Laser */}
         <div className="absolute top-0 left-0 w-full h-[2px] opacity-30 animate-[scan_5s_linear_infinite]" style={{ backgroundColor: currentHexColor, boxShadow: `0 0 20px ${currentHexColor}` }} />
      </div>

      <AnimatePresence>
        {showResult && result && (
          <ResultOverlay correct={result.correct} points={result.points} correctAnswer={result.correctAnswer} explanation={result.explanation} onNext={nextQuestion} />
        )}
      </AnimatePresence>

      {/* Top HUD: Diagnostics & Time */}
      <div className="relative z-40 w-full bg-[#000]/60 backdrop-blur-2xl border-b border-white/10 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {/* Radar Timer Bar */}
        <div className="w-full h-1 bg-white/10 relative overflow-hidden">
           <motion.div 
             className={`absolute top-0 left-0 h-full ${isUrgent ? 'bg-[#FF003C] animate-pulse' : ''}`} 
             style={{ width: `${timePct * 100}%`, backgroundColor: isUrgent ? '#FF003C' : currentHexColor, transition: 'width 1s linear', boxShadow: `0 0 15px ${isUrgent ? '#FF003C' : currentHexColor}` }} 
           />
        </div>
        
        <div className="flex items-center justify-between px-6 md:px-12 py-5">
           {/* Left: Holographic Operator Profile */}
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 bg-black/80 border-[2px] flex items-center justify-center text-xl md:text-3xl clip-hex shadow-[0_0_20px_currentColor]`} style={{ borderColor: currentHexColor, color: currentHexColor }}>
                 {['🧠', '⚡', '🎯'][team?.currentPlayerIndex || 0]}
              </div>
              <div className="flex flex-col">
                 <span className="font-mono text-[10px] md:text-xs text-white/50 tracking-[0.5em] uppercase mb-1">Active Operator</span>
                 <span className="font-display font-black text-lg md:text-xl tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase">{team?.players?.[team?.currentPlayerIndex]?.name || 'UNKNOWN'}</span>
              </div>
           </div>

           {/* Center: Digital Countdown */}
           <div className={`hidden md:flex items-center gap-4 font-display font-black text-3xl tracking-[0.2em] ${isUrgent ? 'text-[#FF003C] animate-pulse' : 'text-white'}`}>
              <Clock size={24} className="text-white/30" />
              {Math.floor(timeLeft / 60)}<span className="text-white/30 mx-1">:</span>{String(timeLeft % 60).padStart(2, '0')}
           </div>

           {/* Right: Telemetry & Score */}
           <div className="flex items-center gap-8">
              <div className="hidden sm:flex flex-col items-end">
                 <span className="font-mono text-[10px] md:text-xs text-white/50 tracking-[0.5em] uppercase mb-1">Phase</span>
                 <span className={`font-mono text-sm tracking-widest uppercase font-bold`} style={{ color: currentHexColor }}>
                    {round === 1 ? '01_Decode' : round === 2 ? '02_Pattern' : '03_Reverse'}
                 </span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="font-mono text-[10px] md:text-xs text-white/50 tracking-[0.5em] uppercase mb-1">Cycles</span>
                 <div className="flex items-center gap-2">
                    <Activity size={16} className="text-white/60 animate-pulse" />
                    <span className="font-display font-black text-2xl md:text-3xl tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{team?.scores?.[`round${round}`] || 0}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Command Console Interface */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center px-6 md:px-12 py-8 z-20">
         <div className="w-full max-w-6xl flex flex-col items-center justify-center h-full">
            
            {!isRoundActive ? (
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="relative w-full max-w-xl text-center">
                 <div className="bg-[#000]/40 border border-white/10 rounded-[30px] p-8 md:p-12 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                   
                   <Radar className="w-14 h-14 mx-auto mb-6 animate-spin relative z-10" style={{ color: currentHexColor }} />
                   
                   <h2 className="relative z-10 font-display font-light text-3xl md:text-4xl text-white mb-4 tracking-[0.2em] uppercase">
                     <ScrambleText text={session?.status === 'waiting' ? 'Awaiting Uplink' : session?.status === 'finished' ? 'Simulation Ended' : 'System Suspended'} duration={1200} />
                   </h2>
                   
                   <p className="relative z-10 font-mono text-xs text-white/40 tracking-[0.4em] uppercase">Maintain Connection Protocol...</p>
                   
                   {session?.status === 'finished' && (
                     <motion.button 
                       whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => router.push(`/team/${teamId}`)} 
                       className="relative z-10 mt-8 w-full max-w-[200px] mx-auto flex items-center justify-center gap-3 py-4 rounded-full border border-white/20 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all hover:border-white/50"
                     >
                        Dashboard <ArrowRight className="w-4 h-4" />
                     </motion.button>
                   )}
                 </div>
               </motion.div>
            ) : allAnswered ? (
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="relative w-full max-w-xl text-center">
                 <div className="bg-[#000]/40 border border-white/10 rounded-[30px] p-8 md:p-12 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-[#00FF66]/5 to-transparent opacity-50" />
                   
                   <CheckCircle2 className="relative z-10 w-14 h-14 mx-auto mb-6 text-[#00FF66] drop-shadow-[0_0_20px_rgba(0,255,102,0.4)]" strokeWidth={1} />
                   
                   <h2 className="relative z-10 font-display font-light text-4xl md:text-5xl text-[#00FF66] mb-4 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                      Phase Secured
                   </h2>
                   
                   <p className="relative z-10 font-mono text-xs text-[#00FF66]/60 tracking-[0.4em] uppercase mb-8">All nodes decrypted</p>
                   
                   <div className="relative z-10 bg-[#00FF66]/5 border border-[#00FF66]/20 rounded-2xl p-6 inline-block mb-8 min-w-[200px]">
                      <div className="font-mono text-[10px] text-white/50 mb-3 tracking-[0.4em] uppercase">Acquired Cycles</div>
                      <div className="font-display font-light text-5xl text-white">{team?.scores?.[`round${round}`] || 0}</div>
                   </div>
                   
                   <motion.button 
                     whileHover={{ scale: 1.02, backgroundColor: "rgba(0,255,102,0.1)" }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => router.push(`/team/${teamId}`)} 
                     className="relative z-10 w-full max-w-[200px] mx-auto flex items-center justify-center gap-3 py-4 rounded-full border border-[#00FF66]/40 text-[#00FF66] font-mono text-xs tracking-[0.2em] uppercase transition-all hover:border-[#00FF66]"
                     >
                      Dashboard <ArrowRight className="w-4 h-4" />
                   </motion.button>
                 </div>
               </motion.div>
            ) : (
               <AnimatePresence mode="wait">
                 {currentQ && (
                   <motion.div 
                     key={currentQ._id}
                     initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }} 
                     animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                     exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }} 
                     transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                     className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 h-full"
                   >
                     {/* LEFT SIDE: The Question Core */}
                     <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center">
                        {/* Spinning Core Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-20">
                           <div className="absolute inset-0 rounded-full border-4 border-dashed animate-[spin_30s_linear_infinite]" style={{ borderColor: currentHexColor }} />
                           <div className="absolute inset-8 rounded-full border-2 animate-[spin_20s_linear_infinite_reverse]" style={{ borderColor: currentHexColor }} />
                        </div>
                        
                        <div className="font-mono text-[10px] md:text-xs text-white/50 tracking-[0.8em] uppercase mb-8 flex items-center justify-center gap-4 w-full">
                           <span className="h-[1px] flex-1 opacity-30" style={{ backgroundColor: currentHexColor }} />
                           DATA NODE {currentQIdx + 1} // {questions.length}
                           <span className="h-[1px] flex-1 opacity-30" style={{ backgroundColor: currentHexColor }} />
                        </div>

                        <div className="relative bg-[#000]/60 backdrop-blur-2xl border border-white/10 p-10 md:p-14 text-center w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] clip-angled-lg">
                           {/* Geometric accents */}
                           <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 opacity-50" style={{ borderColor: currentHexColor }} />
                           <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 opacity-50" style={{ borderColor: currentHexColor }} />
                           
                           {round === 2 && currentQ.emojiClue && (
                              <div className="text-6xl md:text-8xl lg:text-9xl mb-10 p-6 bg-black/50 border border-white/5 inline-block mx-auto clip-hex shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
                                {currentQ.emojiClue}
                              </div>
                           )}
                           
                           {round === 3 && !currentQ.isAnswered && (
                              <div className="mb-8 font-mono text-xs md:text-sm text-[#FF003C] border border-[#FF003C]/30 bg-[#FF003C]/10 p-4 flex items-center justify-center gap-3 tracking-widest uppercase clip-slant shadow-[0_0_20px_rgba(255,0,60,0.2)]">
                                <AlertTriangle size={18} className="animate-pulse" />
                                CRITICAL OVERRIDE: SELECT THE OPPOSITE
                              </div>
                           )}

                           <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                              <ScrambleText text={currentQ.question} duration={1000} />
                           </h2>
                        </div>
                     </div>

                     {/* RIGHT SIDE: The Action Options */}
                     <div className="w-full lg:w-1/2 flex flex-col gap-5">
                       {currentQ.options?.map((opt, i) => {
                         const letter = ['A', 'B', 'C', 'D'][i];
                         const isSelected = selectedAnswer === opt;
                         const isAnswered = currentQ.isAnswered;
                         
                         return (
                           <motion.button
                              initial={{ opacity: 0, x: 50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                              whileHover={!isAnswered && !showResult ? { scale: 1.02, x: -10 } : {}}
                              whileTap={!isAnswered && !showResult ? { scale: 0.98 } : {}}
                              key={i}
                              onClick={() => !isAnswered && !showResult && submitAnswer(opt)}
                              disabled={isAnswered || showResult}
                              className={`group relative flex items-center gap-6 p-6 md:p-8 transition-all duration-300 border-l-4 clip-slant overflow-hidden ${
                                isSelected 
                                  ? 'bg-[#000]/80 text-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' 
                                  : isAnswered 
                                    ? 'bg-black/40 text-white/20 border-white/5 cursor-not-allowed' 
                                    : 'bg-black/60 backdrop-blur-xl text-white border-transparent hover:bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                              }`}
                              style={{ borderLeftColor: isSelected ? currentHexColor : isAnswered ? 'transparent' : 'rgba(255,255,255,0.1)' }}
                           >
                              {/* Hover Glow Background */}
                              {!isAnswered && !showResult && !isSelected && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundColor: currentHexColor }} />
                              )}
                              
                              {/* Target Lock Icon */}
                              {!isAnswered && !showResult && (
                                <Crosshair className={`absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 animate-spin-slow transition-opacity duration-300 w-8 h-8`} style={{ color: currentHexColor }} />
                              )}
                              
                              <div className={`flex items-center justify-center w-12 h-12 border-2 clip-hex shrink-0 transition-colors duration-300 ${isSelected ? 'border-white text-white' : 'border-white/20 text-white/50 group-hover:text-white'}`} style={{ borderLeftColor: isSelected ? currentHexColor : undefined }}>
                                 <span className="font-display font-black text-xl">{letter}</span>
                              </div>
                              
                              <span className={`font-body text-left text-lg md:text-xl lg:text-2xl tracking-wide leading-snug ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                 {opt}
                              </span>
                           </motion.button>
                         );
                       })}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            )}
         </div>
      </div>
    </div>
  );
}
