'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimationFrame } from 'framer-motion';

// --- Standby State: Powered Down Hypercar Console ---
function PoweredDownConsole() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 1.05, filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center w-full max-w-[1400px] h-[500px]"
    >
      <div className="absolute inset-0 bg-[#050508]/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)_inset] flex flex-col items-center justify-center overflow-hidden" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0% 50%)' }}>
        
        {/* Cyber-grid and Ambient Orbs from Login Page */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#4285F4]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#EA4335]/10 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Horizontal Scanner Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#4285F4] shadow-[0_0_20px_#4285F4] animate-[scan_4s_ease-in-out_infinite]" />

        <div className="relative z-10 flex flex-col items-center">
           {/* GDG / Cyberpunk Lock Icon */}
           <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center mb-6 relative">
             <div className="absolute inset-0 border-2 border-dashed border-[#4285F4]/30 rounded-full animate-[spin_10s_linear_infinite]" />
             <div className="absolute inset-4 border border-[#EA4335]/30 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Google_Developer_Groups_logo.svg/512px-Google_Developer_Groups_logo.svg.png" alt="GDG Logo" fetchPriority="high" className="w-8 h-8 opacity-50 grayscale animate-pulse" />
           </div>

           <div className="text-[10px] font-mono tracking-[0.8em] text-[#4285F4] uppercase mb-2">GDG_CORE // TELEMETRY LINK</div>
           <div className="text-5xl font-black tracking-[0.4em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">STANDBY</div>
           <div className="flex items-center gap-3 mt-6">
              <span className="w-2 h-2 bg-[#FBBC05] rounded-full animate-pulse shadow-[0_0_10px_#FBBC05]" />
              <div className="text-[9px] font-mono tracking-[0.4em] text-gray-400 uppercase">Awaiting Arena Initialization...</div>
           </div>
        </div>

        {/* Angular Background Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>
    </motion.div>
  );
}

// --- Active State: Angular Hypercar Speedometer ---
function ActiveHyperSpeedometer({ session, team }) {
  const round = session?.currentRound || 1;
  const isR1 = round === 1;
  const isR2 = round === 2;
  
  // High-end Hypercar Colors
  const themeColor = isR1 ? '#00E5FF' : isR2 ? '#FFB800' : '#FF003C';
  const targetPct = isR1 ? 0.35 : isR2 ? 0.68 : 0.98;

  // Physical, heavy spring for the needle
  const motionPct = useMotionValue(0);
  const springPct = useSpring(motionPct, { stiffness: 90, damping: 12, mass: 1.5 });

  useEffect(() => {
    // Dramatic power-on sweep
    const t1 = setTimeout(() => motionPct.set(1), 500); // Rev to max
    const t2 = setTimeout(() => motionPct.set(targetPct), 1200); // Settle at target

    const interval = setInterval(() => {
      // Violent mechanical jitter
      if (Math.random() > 0.85) {
        // "Gear shift" drop
        motionPct.set(Math.max(0, targetPct - (0.15 + Math.random() * 0.1)));
        setTimeout(() => motionPct.set(targetPct + Math.random() * 0.05), 250);
      } else {
        // Constant vibration
        motionPct.set(targetPct + (Math.random() - 0.5) * 0.02);
      }
    }, 500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval); };
  }, [targetPct, motionPct]);

  // Polygon calculations (Custom angular shape instead of perfect circle)
  // We'll create a sweeping arc using a path, but make the needle an angular physical object
  const cx = 700, cy = 500, r = 450;
  
  // Angles: -70 to 70 for a flatter, wider sweep common in supercars
  const angleRange = 140;
  const startAngle = -70;
  const needleAngle = useTransform(springPct, [0, 1], [startAngle, startAngle + angleRange]);
  
  // Track fill percentage for an SVG path dashoffset is tricky for arbitrary paths,
  // but we can map the dashoffset of a massive circle exactly to the angle range.
  const circum = 2 * Math.PI * r;
  const visibleArcLength = (angleRange / 360) * circum;
  
  // Offset goes from visibleArcLength (empty) to 0 (full)
  const trackOffset = useTransform(springPct, [0, 1], [visibleArcLength, 0]);

  // Digital RPM
  const rpmValue = useTransform(springPct, [0, 1], [0, 12000]);
  const [displayRpm, setDisplayRpm] = useState('00000');
  useAnimationFrame(() => {
    setDisplayRpm(Math.round(rpmValue.get()).toString().padStart(5, '0'));
  });

  // Ticks for the angular path
  const ticks = [];
  for(let i=0; i<=40; i++) {
    const pct = i/40;
    const angle = startAngle + (pct * angleRange);
    const rad = (angle - 90) * Math.PI / 180; // -90 because 0 is straight up in our rotation logic
    
    const isMajor = i % 5 === 0;
    const rIn = isMajor ? r - 40 : r - 15;
    const rOut = r;
    
    let tickColor = 'rgba(255,255,255,0.1)';
    if (pct <= 0.35) tickColor = 'rgba(0, 229, 255, 0.4)';
    else if (pct <= 0.68) tickColor = 'rgba(255, 184, 0, 0.4)';
    else tickColor = 'rgba(255, 0, 60, 0.4)';

    ticks.push(
      <line 
        key={`t${i}`}
        x1={cx + rIn * Math.cos(rad)} y1={cy + rIn * Math.sin(rad)}
        x2={cx + rOut * Math.cos(rad)} y2={cy + rOut * Math.sin(rad)}
        stroke={tickColor} strokeWidth={isMajor ? "6" : "3"} 
        strokeLinecap="square"
      />
    );
    
    if (isMajor) {
      const numR = r - 70;
      const val = Math.round(pct * 12);
      ticks.push(
        <text key={`n${i}`} x={cx + numR * Math.cos(rad)} y={cy + numR * Math.sin(rad) + 10} 
          fill={pct <= 0.35 ? '#00E5FF' : pct <= 0.68 ? '#FFB800' : '#FF003C'} 
          fontSize="36" fontFamily="sans-serif" fontStyle="italic" fontWeight="900" textAnchor="middle" opacity="0.8">
          {val}
        </text>
      );
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 1.2, type: 'spring', bounce: 0.2 }}
      className="relative flex items-center justify-center w-full max-w-[1400px] h-[600px]"
      style={{ perspective: '1000px' }}
    >
      <div className="absolute top-[60%] w-[100%] h-[40%] bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
      
      {/* Massive Angular Dashboard Canvas */}
      <svg viewBox="0 0 1400 600" className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_30px_50px_rgba(0,0,0,0.9)]">
        <defs>
          <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="hyper-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4 12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="solidTrack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#FF003C" />
          </linearGradient>
        </defs>

        {/* Dark Brushed Metal Base shape */}
        <path d={`M 100,600 L 300,100 L 1100,100 L 1300,600 Z`} fill="#080808" stroke="#222" strokeWidth="4" />
        <path d={`M 120,600 L 310,120 L 1090,120 L 1280,600 Z`} fill="none" stroke="#111" strokeWidth="2" />
        
        {/* Track Background */}
        <motion.circle 
          cx={cx} cy={cy} r={r} 
          fill="none" stroke="#111" strokeWidth="60"
          strokeDasharray={`${visibleArcLength} ${circum}`}
          style={{ transform: `rotate(${startAngle - 90}deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Ticks */}
        <g>{ticks}</g>

        {/* Liquid Light Active Track */}
        <motion.circle 
          cx={cx} cy={cy} r={r} 
          fill="none" stroke="url(#solidTrack)" strokeWidth="60"
          strokeDasharray={`${visibleArcLength} ${circum}`}
          style={{ 
            strokeDashoffset: trackOffset,
            transform: `rotate(${startAngle - 90}deg)`, 
            transformOrigin: `${cx}px ${cy}px`,
            filter: 'url(#neon)'
          }}
        />

        {/* Telemetry Geometry (Left & Right Wings) */}
        <g opacity="0.8">
          {/* Left Wing - Scores */}
          <path d="M 200,450 L 350,250 L 500,250 L 400,450 Z" fill="#030303" stroke="#222" strokeWidth="2" />
          <text x="350" y="320" fill="gray" fontSize="14" fontFamily="mono" tracking="widest" textAnchor="middle">SCORE</text>
          <text x="360" y="400" fill="#fff" fontSize="64" fontFamily="sans-serif" fontStyle="italic" fontWeight="900" textAnchor="middle">{team?.scores?.total || 0}</text>
          
          {/* Right Wing - Phase Info */}
          <path d="M 1200,450 L 1050,250 L 900,250 L 1000,450 Z" fill="#030303" stroke="#222" strokeWidth="2" />
          <text x="1050" y="320" fill="gray" fontSize="14" fontFamily="mono" tracking="widest" textAnchor="middle">PHASE</text>
          <text x="1040" y="400" fill={themeColor} fontSize="64" fontFamily="sans-serif" fontStyle="italic" fontWeight="900" textAnchor="middle" filter="url(#neon)">0{round}</text>
        </g>

        {/* Massive Center Block */}
        <path d={`M ${cx-150},${cy} L ${cx-100},${cy-180} L ${cx+100},${cy-180} L ${cx+150},${cy} Z`} fill="#0a0a0a" stroke="#111" strokeWidth="8" />
        
        <text x={cx} y={cy - 140} fill="rgba(255,255,255,0.2)" fontSize="18" fontFamily="mono" tracking="widest" textAnchor="middle">REV/MIN</text>
        <text x={cx} y={cy - 50} fill="#fff" fontSize="80" fontFamily="sans-serif" fontStyle="italic" fontWeight="900" textAnchor="middle" filter="url(#neon)">
          {displayRpm}
        </text>

        {/* Aggressive Angular Needle */}
        <motion.g style={{ rotate: needleAngle, originX: `${cx}px`, originY: `${cy}px` }}>
          
          {/* Faint trails */}
          <polygon points={`${cx},${cy-20} ${cx},${cy} ${cx},${cy-r+80}`} fill={themeColor} opacity="0.3" filter="url(#hyper-blur)" transform={`rotate(-4, ${cx}, ${cy})`} />
          <polygon points={`${cx},${cy-20} ${cx},${cy} ${cx},${cy-r+80}`} fill={themeColor} opacity="0.5" filter="url(#hyper-blur)" transform={`rotate(-2, ${cx}, ${cy})`} />
          
          {/* Physical Shard Base */}
          <polygon points={`${cx-30},${cy+20} ${cx+30},${cy+20} ${cx},${cy-r+50}`} fill="#111" />
          <polygon points={`${cx-15},${cy+10} ${cx+15},${cy+10} ${cx},${cy-r+60}`} fill="#222" />
          
          {/* Glowing Center Line */}
          <polygon points={`${cx-2},${cy} ${cx+2},${cy} ${cx},${cy-r+20}`} fill="#fff" filter="url(#neon)" />
          
          {/* Glowing Tip */}
          <polygon points={`${cx-10},${cy-r+100} ${cx+10},${cy-r+100} ${cx},${cy-r-10}`} fill={themeColor} filter="url(#neon)" />

          {/* Central Hub */}
          <path d={`M ${cx-50},${cy+40} L ${cx-30},${cy-30} L ${cx+30},${cy-30} L ${cx+50},${cy+40} Z`} fill="#050505" stroke="#222" strokeWidth="4" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

// --- Player Dashboard Overhaul ---
export default function TeamClient({ initialTeam, initialSession }) {
  const { teamId } = useParams();
  const router = useRouter();
  const [team, setTeam] = useState(initialTeam);
  const [session, setSession] = useState(initialSession);

  useEffect(() => {
    fetchTeam();
    const interval = setInterval(fetchTeam, 3000); // Fast polling for auto-halt
    return () => clearInterval(interval);
  }, [teamId]);

  async function fetchTeam() {
    try {
      const [teamRes, sessionRes] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch('/api/game/status', { cache: 'no-store' }),
      ]);
      if (!teamRes.ok) return;
      const { team } = await teamRes.json();
      const { session } = await sessionRes.json();
      setTeam(team);
      setSession(session);
    } catch {}
  }

  const globalStyles = `
    body { background-color: #030303; margin: 0; padding: 0; overflow: hidden; }
    @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
  `;



  const isActive = session?.status?.includes('_active');
  const isFinished = session?.status === 'finished';

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white font-sans flex flex-col relative selection:bg-red-600/30">
      <style>{globalStyles}</style>

      {/* Brutalist Background */}
      <div className="absolute inset-0 bg-[url('/images/carbon-fibre.png')] opacity-20 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-20" />
      
      {/* Top Header - Extremely Minimal */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-1 bg-red-600" />
          <div className="font-display font-black text-2xl tracking-[0.3em] uppercase opacity-80">{team?.teamName}</div>
        </div>
        <Link href="/" className="font-mono text-[10px] text-gray-500 hover:text-white tracking-[0.5em] uppercase transition-colors">
          [ Disconnect ]
        </Link>
      </div>

      {/* Main Ultra-Wide Canvas */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative z-10 pt-16">
        <AnimatePresence mode="wait">
          {isActive ? (
            <ActiveHyperSpeedometer key="speedometer" session={session} team={team} />
          ) : (
            <PoweredDownConsole key="console" />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Launch Button */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] z-50"
      >
        <button 
          onClick={() => { if (isActive) router.push(`/play/${teamId}`); }}
          className={`relative w-full h-20 overflow-hidden transition-all duration-300 ${
            isActive 
              ? 'bg-red-600/10 border-t-2 border-b-2 border-red-600 hover:bg-red-600/20 cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.2)]' 
              : 'bg-[#111] border-t-2 border-b-2 border-[#333] cursor-not-allowed opacity-50 grayscale'
          }`}
          style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0% 100%)' }}
        >
          <div className="relative z-10 h-full flex flex-col items-center justify-center">
            <div className={`text-2xl font-black tracking-[0.4em] uppercase ${isActive ? 'text-white drop-shadow-[0_0_10px_#fff]' : 'text-gray-500'}`}>
              {isFinished ? 'SIMULATION COMPLETE' : isActive ? 'ENGAGE IGNITION' : 'SYSTEM LOCKED'}
            </div>
          </div>
        </button>
      </motion.div>

    </div>
  );
}
