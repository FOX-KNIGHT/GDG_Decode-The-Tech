'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const GdgLogo = ({ className = "w-8 h-8" }) => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Google_Developer_Groups_logo.svg/512px-Google_Developer_Groups_logo.svg.png" alt="GDG Logo" className={`${className} object-contain drop-shadow-md`} />
);

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData(); 
    const i = setInterval(fetchData, 5000); 
    return () => clearInterval(i); 
  }, []);

  async function fetchData() {
    try {
      const [sRes, tRes] = await Promise.all([fetch('/api/game/status'), fetch('/api/teams')]);
      setSession((await sRes.json()).session);
      setTeams((await tRes.json()).teams || []);
    } catch (e) {
      console.error(e);
    }
  }

  function showMsg(text, type = 'success') { 
    setMsg({ text, type }); 
    setTimeout(() => setMsg({ text: '', type: '' }), 4000); 
  }

  async function controlGame(action, round) {
    setLoading(true);
    const adminPass = sessionStorage.getItem('admin_pass') || '';
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
        body: JSON.stringify({ action, round }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || 'COMMAND EXECUTED', 'success');
      } else {
        showMsg(data.error || 'EXECUTION FAILED', 'error');
      }
      fetchData();
    } catch (e) {
      showMsg('NETWORK ERR', 'error');
    }
    setLoading(false);
  }

  async function seedDatabase() {
    if (!confirm('CRITICAL: WIPE ALL DATA AND RE-SEED? THIS ACTION IS IRREVERSIBLE.')) return;
    setLoading(true);
    const adminPass = sessionStorage.getItem('admin_pass') || '';
    try {
      const res = await fetch('/api/admin/seed', { 
        method: 'POST',
        headers: { 'x-admin-password': adminPass }
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || 'DB SEEDED', 'success');
      } else {
        showMsg(data.error || 'SEED FAILED', 'error');
      }
      fetchData();
    } catch (e) {
      showMsg('NETWORK ERR', 'error');
    }
    setLoading(false);
  }

  const status = session?.status || 'waiting';
  const isLive = status.includes('_active');
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, scale: 0.95, skewX: 5 }, show: { opacity: 1, scale: 1, skewX: 0, transition: { type: "spring", stiffness: 60, damping: 20 } } };

  return (
    <div className="min-h-screen relative bg-dark-950 text-gray-200 overflow-hidden font-body selection:bg-gdg-red/30 selection:text-white">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen z-0"></div>
      <div className="cyber-grid absolute inset-0 pointer-events-none z-0"></div>
      <div className="gdg-watermark-bg z-0 opacity-[0.02]" style={{ transform: 'translate(-50%, -50%) rotate(-15deg)' }}></div>
      
      {/* Background Ambience */}
      <div className="ambient-orb orb-red z-0 opacity-40"></div>
      <div className="ambient-orb orb-blue z-0 opacity-40"></div>

      {/* Futuristic Navigation Bar */}
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="relative z-50 w-full pt-6 px-6 max-w-[1400px] mx-auto flex justify-between items-start">
        <Link href="/" className="clip-angled-br bg-dark-900 border border-white/10 px-6 py-3 font-display font-bold text-[10px] text-gray-400 hover:text-white transition-all flex items-center gap-3 uppercase tracking-[0.3em] group shadow-glass">
          <span className="text-gdg-red group-hover:animate-pulse">◄</span> EXIT_SUDO
        </Link>
        <div className="clip-angled-tl bg-dark-900/90 backdrop-blur-md border border-white/10 px-8 py-4 flex items-center gap-6 shadow-glass">
          <div className="flex items-center gap-3">
             <GdgLogo className="w-6 h-6 animate-holo-flicker grayscale group-hover:grayscale-0 transition-all" />
             <span className="font-display font-black text-xl tracking-[0.3em] text-white">SUDO_CORE</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10"></div>
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 ${isLive ? 'bg-gdg-green shadow-[0_0_10px_#34A853] animate-pulse' : 'bg-gdg-yellow shadow-[0_0_10px_#FBBC05]'}`} />
            <span className="font-mono text-[9px] font-bold text-gray-300 tracking-[0.3em] uppercase">{status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1400px] mx-auto px-6 py-12 relative z-10">
        
        {/* Geometric Matrix Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            { href: '/admin/teams', icon: 'NODE_MX', label: 'MATRIX', sub: `${teams.length} Nodes`, color: 'gdg-blue' },
            { href: '/admin/questions', icon: 'PAYLOAD', label: 'DATA', sub: 'Manage Queries', color: 'gdg-yellow' },
            { href: '/admin/arena', icon: 'ARENA', label: 'ARENA', sub: 'Preview Questions', color: 'gdg-green' },
            { href: '/admin/game-control', icon: 'SYS_ST', label: 'CONTROL', sub: `Phase ${session?.currentRound || 0}/3`, color: 'gdg-red' },
            { href: '/admin/leaderboard', icon: 'TL_MET', label: 'METRICS', sub: 'Rankings', color: 'gdg-green' },
          ].map((nav, i) => (
            <Link key={nav.href} href={nav.href}>
              <motion.div variants={itemVariants} className={`clip-angled tech-border p-6 h-full flex flex-col items-start transition-all group hover:bg-${nav.color}/5 hover:border-${nav.color}/30 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-2 h-2 bg-${nav.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`font-mono text-[9px] text-${nav.color} tracking-[0.3em] mb-4 group-hover:animate-holo-flicker`}>[{nav.icon}]</div>
                <div className="font-display font-black text-2xl text-white mb-1 tracking-widest">{nav.label}</div>
                <div className="font-mono text-[10px] text-gray-500 tracking-[0.2em] uppercase">{nav.sub}</div>
                <div className="mt-6 text-gray-700 group-hover:text-white transition-colors text-xl">►</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Master Control override */}
        <motion.div variants={itemVariants} className="tech-border clip-angled bg-dark-900/80 backdrop-blur-md p-8 md:p-12 relative max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <div className="absolute top-0 right-10 w-48 h-[1px] bg-gdg-red shadow-[0_0_15px_#EA4335]"></div>
           <div className="absolute -left-5 top-20 w-[1px] h-32 bg-white/10"></div>
           
           <div className="flex flex-col items-center text-center mb-10">
             <div className="w-16 h-16 border border-gdg-red/30 bg-gdg-red/5 flex items-center justify-center mb-6 clip-hex shadow-[0_0_30px_rgba(234,67,53,0.1)]">
               <span className="text-gdg-red text-2xl animate-pulse">!</span>
             </div>
             <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-[0.2em] mb-2">MASTER_CONTROL</h2>
             <p className="font-mono text-[10px] text-gray-500 tracking-[0.4em] uppercase">Authorized System Override Active</p>
           </div>

           <AnimatePresence>
             {msg.text && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-8 p-4 font-mono text-[10px] tracking-[0.3em] uppercase border-l-2 text-center ${msg.type === 'error' ? 'bg-gdg-red/10 text-gdg-red border-gdg-red' : 'bg-gdg-green/10 text-gdg-green border-gdg-green'}`}>
                 {msg.text}
               </motion.div>
             )}
           </AnimatePresence>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             {[1, 2, 3].map(r => (
               <button key={r} onClick={() => controlGame('start_round', r)} disabled={loading}
                 className="clip-angled bg-dark-950 border border-white/10 hover:border-gdg-blue hover:bg-gdg-blue/5 py-6 flex flex-col items-center justify-center gap-2 group transition-all disabled:opacity-50">
                 <span className="font-mono text-[9px] text-gray-600 group-hover:text-gdg-blue tracking-[0.3em]">INITIATE_PHASE</span>
                 <span className="font-display font-bold text-white tracking-widest text-lg">0{r}</span>
               </button>
             ))}
           </div>

           <button onClick={() => controlGame('finish')} disabled={loading}
             className="clip-angled-br w-full bg-gdg-yellow/10 border border-gdg-yellow/50 hover:bg-gdg-yellow text-gdg-yellow hover:text-black py-6 font-display font-black tracking-[0.3em] uppercase transition-all hover:shadow-[0_0_30px_rgba(251,188,5,0.4)] mb-8 disabled:opacity-50">
             TERMINATE SIMULATION
           </button>

           <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-6 justify-center">
             <button onClick={() => { if (confirm('CRITICAL: PURGE ALL?')) controlGame('reset'); }} disabled={loading}
               className="font-mono text-[9px] text-gdg-red border border-gdg-red/30 hover:bg-gdg-red/10 px-8 py-3 tracking-[0.4em] uppercase transition-colors disabled:opacity-50">
               [ PURGE_DATA ]
             </button>
             <button onClick={seedDatabase} disabled={loading}
               className="font-mono text-[9px] text-gray-500 border border-gray-700 hover:text-white hover:border-white/30 px-8 py-3 tracking-[0.4em] uppercase transition-colors disabled:opacity-50">
               [ SEED_DB ]
             </button>
           </div>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
