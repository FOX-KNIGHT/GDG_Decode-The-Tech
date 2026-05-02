'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const ROUND_LABELS = { 1: 'Match The Following', 2: 'Guess The Tech', 3: 'Real or Fake?' };
const ROUND_COLORS = { 1: 'gdg-blue', 2: 'gdg-yellow', 3: 'gdg-red' };
const EMPTY_FORM = { type: 'mcq', round: 1, question: '', emojiClue: '', options: ['', '', '', ''], correctAnswer: '', matchPairs: [{ left: '', right: '' }], actualFact: 'Real', explanation: '', basePoints: 10 };

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRound, setFilterRound] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    const res = await fetch('/api/questions');
    const { questions } = await res.json();
    setQuestions(questions);
    setLoading(false);
  }

  function showMsg(text, type = 'success') {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  }

  function startEdit(q) {
    setEditing(q._id);
    setForm({ 
      type: q.type || (q.round === 1 ? 'match' : 'mcq'),
      round: q.round, 
      question: q.question, 
      emojiClue: q.emojiClue || '', 
      options: (q.options || []).concat(['','','','']).slice(0,4), 
      correctAnswer: q.correctAnswer || '', 
      matchPairs: q.matchPairs && q.matchPairs.length > 0 ? q.matchPairs : [{ left: '', right: '' }],
      actualFact: q.actualFact || 'Real', 
      explanation: q.explanation || '', 
      basePoints: q.basePoints || 10 
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); }
  function updateOption(idx, val) { const opts = [...form.options]; opts[idx] = val; setForm({ ...form, options: opts }); }
  
  function addMatchPair() {
    setForm({ ...form, matchPairs: [...form.matchPairs, { left: '', right: '' }] });
  }
  function updateMatchPair(idx, field, val) {
    const pairs = [...form.matchPairs];
    pairs[idx][field] = val;
    setForm({ ...form, matchPairs: pairs });
  }
  function removeMatchPair(idx) {
    if (form.matchPairs.length <= 1) return;
    setForm({ ...form, matchPairs: form.matchPairs.filter((_, i) => i !== idx) });
  }

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const adminPass = sessionStorage.getItem('admin_pass') || '';
    
    const payload = { 
      ...form, 
      round: parseInt(form.round), 
      basePoints: parseInt(form.basePoints),
      options: form.type === 'mcq' ? form.options.filter(Boolean) : [],
      matchPairs: form.type === 'match' ? form.matchPairs.filter(p => p.left && p.right) : []
    };

    if (payload.type === 'mcq' && !payload.options.includes(payload.correctAnswer)) { 
      showMsg('Correct answer must match one of the options exactly!', 'error'); 
      setSaving(false); 
      return; 
    }
    
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { _id: editing, ...payload } : payload;
      const res = await fetch('/api/questions', { 
        method, 
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass }, 
        body: JSON.stringify(body) 
      });
      if (res.ok) { 
        showMsg(editing ? 'Question updated!' : 'Question added!'); 
        resetForm(); 
        fetchQuestions(); 
      }
      else showMsg('Save failed', 'error');
    } catch { showMsg('Network error', 'error'); }
    setSaving(false);
  }

  async function deleteQuestion(id, q) {
    if (!confirm(`Delete: "${q.slice(0, 60)}..."?`)) return;
    const adminPass = sessionStorage.getItem('admin_pass') || '';
    await fetch(`/api/questions?id=${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPass } });
    showMsg('Question deleted'); fetchQuestions();
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const adminPass = sessionStorage.getItem('admin_pass') || '';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/questions/import', {
        method: 'POST',
        headers: { 'x-admin-password': adminPass },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message);
        fetchQuestions();
      } else {
        showMsg(data.error || 'Import failed', 'error');
      }
    } catch {
      showMsg('Network error during import', 'error');
    }
    setImporting(false);
    e.target.value = ''; // Reset input
  }

  const filtered = filterRound === 0 ? questions : questions.filter(q => q.round === filterRound);
  const counts = { 1: questions.filter(q => q.round === 1).length, 2: questions.filter(q => q.round === 2).length, 3: questions.filter(q => q.round === 3).length };

  return (
    <div className="min-h-screen relative bg-dark-950 text-gray-200 overflow-hidden font-body selection:bg-gdg-blue/30 selection:text-white">
      <div className="absolute inset-0 bg-[url('/images/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen z-0"></div>
      <div className="cyber-grid absolute inset-0 pointer-events-none z-0"></div>
      <div className="gdg-watermark-bg z-0 opacity-[0.02]" style={{ transform: 'translate(-50%, -50%) rotate(-10deg) scale(1.3)' }}></div>

      <div className="border-b border-white/10 bg-dark-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="clip-angled-br font-mono text-[10px] text-gray-400 hover:text-white transition-colors tracking-[0.3em] flex items-center gap-2 bg-dark-950 px-6 py-2 border border-white/10 hover:border-white/30 uppercase">
            <span className="text-gdg-blue text-lg leading-none -mt-1 group-hover:animate-pulse">◄</span> MAIN_CORE
          </Link>
          <div className="font-display font-black text-xl md:text-2xl text-white tracking-[0.3em] flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <span className="w-2 h-2 bg-gdg-blue animate-pulse shadow-[0_0_10px_#4285F4]"></span>
            DATA_PAYLOADS ({questions.length})
          </div>
          <div className="flex items-center gap-4">
            <label className="clip-angled font-display font-bold text-[10px] tracking-[0.3em] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 px-6 py-3 transition-all uppercase cursor-pointer">
              {importing ? 'IMPORTING...' : '📋 DOCX_IMPORT'}
              <input type="file" accept=".docx" onChange={handleImport} className="hidden" disabled={importing} />
            </label>
            <button onClick={() => setShowForm(!showForm)} className="clip-angled font-display font-bold text-[10px] tracking-[0.3em] bg-gdg-blue/10 hover:bg-gdg-blue text-gdg-blue hover:text-white border border-gdg-blue/50 px-6 py-3 transition-all shadow-[0_0_15px_rgba(66,133,244,0.3)] uppercase">
              + NEW_QUERY
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-8 relative z-10 animate-reveal-up">
        {msg && <div className={`clip-angled p-4 font-mono text-[10px] tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 uppercase ${msgType === 'error' ? 'border-l-2 border-gdg-red text-gdg-red bg-gdg-red/10' : 'border-l-2 border-gdg-green text-gdg-green bg-gdg-green/10'}`}>
          <span className={`${msgType === 'error' ? 'text-gdg-red' : 'text-gdg-green'} w-2 h-2 animate-pulse bg-current`}></span> {msg}
        </div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(r => (
            <button key={r} onClick={() => setFilterRound(filterRound === r ? 0 : r)}
              className={`clip-angled tech-border p-6 text-center transition-all ${filterRound === r ? `border-${ROUND_COLORS[r]}/50 shadow-[0_0_30px_rgba(var(--${ROUND_COLORS[r]}),0.2)] scale-[1.02] bg-${ROUND_COLORS[r]}/10` : 'bg-dark-900/50 hover:bg-white/[0.02]'}`}>
              <div className={`font-display font-black text-5xl mb-2 ${filterRound === r ? `text-${ROUND_COLORS[r]} drop-shadow-[0_0_15px_currentColor]` : 'text-white'}`}>{counts[r]}</div>
              <div className="font-mono text-[10px] text-gray-400 tracking-[0.3em] uppercase">PHASE 0{r}</div>
              <div className={`font-body text-xs font-bold mt-1 tracking-widest ${filterRound === r ? 'text-white' : 'text-gray-500'}`}>{ROUND_LABELS[r]}</div>
            </button>
          ))}
        </div>

        {showForm && (
          <div className="clip-angled tech-border bg-dark-900/90 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gdg-blue/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 relative z-10">
              <div className="font-display font-black text-2xl text-white tracking-[0.3em] flex items-center gap-3">
                <span className="text-gdg-blue shadow-[0_0_10px_#4285F4]">■</span> {editing ? 'EDIT_PAYLOAD' : 'NEW_PAYLOAD'}
              </div>
              <button onClick={resetForm} className="clip-hex font-mono text-[9px] text-gray-500 hover:text-white bg-dark-950 px-6 py-2 border border-white/10 tracking-[0.3em] uppercase transition-colors">✕ ABORT</button>
            </div>
            
            <form onSubmit={saveQuestion} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="font-mono text-[9px] text-gdg-blue tracking-[0.3em] block mb-2 uppercase">TARGET_PHASE *</label>
                  <select value={form.round} onChange={e => {
                      const r = parseInt(e.target.value);
                      setForm({ ...form, round: r, type: r === 1 ? 'match' : 'mcq' });
                    }}
                    className="w-full bg-dark-950 border border-white/10 text-white font-mono text-xs px-4 py-3 focus:outline-none focus:border-gdg-blue transition-colors">
                    <option value={1}>PHASE 01 — Match The Following</option>
                    <option value={2}>PHASE 02 — Guess The Tech (Emoji)</option>
                    <option value={3}>PHASE 03 — Reverse Logic Gate</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[9px] text-gdg-blue tracking-[0.3em] block mb-2 uppercase">QUERY_TYPE *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 text-white font-mono text-xs px-4 py-3 focus:outline-none focus:border-gdg-blue transition-colors">
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="match">Match The Following</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[9px] text-gdg-blue tracking-[0.3em] block mb-2 uppercase">BASE_REWARD (CYCLES) *</label>
                  <input type="number" value={form.basePoints} onChange={e => setForm({ ...form, basePoints: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 text-white font-mono text-xs px-4 py-3 focus:outline-none focus:border-gdg-blue transition-colors" />
                </div>
              </div>

              <div>
                <label className="font-mono text-[9px] text-gdg-blue tracking-[0.3em] block mb-2 uppercase">
                  {form.type === 'match' ? 'MATCHING_INSTRUCTION *' : form.round === 1 ? 'QUERY_TEXT — Write the MEANING/DEFINITION *' : form.round === 2 ? 'QUERY_TEXT *' : 'TECH FACT STATEMENT *'}
                </label>
                <textarea required value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} rows={3}
                  placeholder={form.type === 'match' ? 'e.g. Match the Jargon with its Core Concept' : form.round === 1 ? 'e.g. Online storage and computing accessed via the internet' : form.round === 2 ? 'Identify the app or platform from this emoji clue' : 'e.g. Google tested smart contact lenses that could monitor blood sugar'}
                  className="w-full bg-dark-950 border border-white/10 text-white font-body text-base px-5 py-4 focus:outline-none focus:border-gdg-blue placeholder-white/20 resize-none transition-colors" />
              </div>

              {form.round === 2 && form.type !== 'match' && (
                <div>
                  <label className="font-mono text-[9px] text-gdg-yellow tracking-[0.3em] block mb-2 uppercase">EMOJI_SIGNATURE 🎯</label>
                  <input value={form.emojiClue} onChange={e => setForm({ ...form, emojiClue: e.target.value })}
                    placeholder="e.g. 📱☁️🎧" className="w-full bg-dark-950 border border-gdg-yellow/30 text-white text-3xl px-4 py-4 focus:outline-none focus:border-gdg-yellow placeholder-white/10 text-center tracking-[0.5em] transition-colors" />
                </div>
              )}

              {form.type === 'mcq' ? (
                <div className="bg-dark-950/50 p-6 border border-white/5 clip-angled">
                  <label className="font-mono text-[9px] text-gdg-blue tracking-[0.3em] block mb-4 uppercase">AVAILABLE_VECTORS *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-stretch clip-angled-br">
                        <span className="font-mono text-[10px] text-gray-500 w-12 flex items-center justify-center border border-white/10 bg-dark-900">{['A','B','C','D'][i]}</span>
                        <input value={opt} onChange={e => updateOption(i, e.target.value)}
                          placeholder={`Option ${['A','B','C','D'][i]}`}
                          className="flex-1 bg-dark-900 border-y border-r border-white/10 text-white font-body text-sm px-4 py-3 focus:outline-none focus:border-gdg-blue placeholder-white/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-dark-950/50 p-6 border border-white/5 clip-angled">
                  <label className="font-mono text-[9px] text-gdg-blue tracking-[0.3em] block mb-4 uppercase">MATCH_PAIRS *</label>
                  <div className="space-y-4">
                    {form.matchPairs.map((pair, i) => (
                      <div key={i} className="flex flex-col md:flex-row items-center gap-4">
                        <input value={pair.left} onChange={e => updateMatchPair(i, 'left', e.target.value)}
                          placeholder="Left Side" className="flex-1 bg-dark-900 border border-white/10 text-white font-body text-sm px-4 py-3 focus:outline-none focus:border-gdg-blue transition-colors clip-angled-br" />
                        <span className="text-gdg-blue opacity-50">↔</span>
                        <input value={pair.right} onChange={e => updateMatchPair(i, 'right', e.target.value)}
                          placeholder="Right Side" className="flex-1 bg-dark-900 border border-white/10 text-white font-body text-sm px-4 py-3 focus:outline-none focus:border-gdg-blue transition-colors clip-angled-br" />
                        <button type="button" onClick={() => removeMatchPair(i)} className="text-gdg-red px-2 hover:bg-gdg-red/10 transition-colors">✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={addMatchPair} className="w-full py-2 border border-dashed border-white/20 text-gray-500 hover:text-white hover:border-white/40 transition-all font-mono text-[10px] uppercase tracking-widest">+ Add Pair</button>
                  </div>
                </div>
              )}

              {form.type === 'mcq' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-dark-950/50 p-6 border border-white/5 clip-angled">
                  <div>
                    <label className="font-mono text-[9px] text-gdg-green tracking-[0.3em] block mb-2 uppercase">VALID_SIGNATURE *</label>
                    <select required value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })}
                      className="w-full bg-dark-900 border border-gdg-green/30 text-white font-mono text-xs px-4 py-3 focus:outline-none focus:border-gdg-green transition-colors">
                      <option value="">— Select Target —</option>
                      {form.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  {form.round === 3 && (
                    <div>
                      <label className="font-mono text-[9px] text-gray-400 tracking-[0.3em] block mb-2 uppercase">ACTUAL_STATE</label>
                      <select value={form.actualFact} onChange={e => setForm({ ...form, actualFact: e.target.value })}
                        className="w-full bg-dark-900 border border-white/10 text-white font-mono text-xs px-4 py-3 focus:outline-none focus:border-white/30">
                        <option value="Real">Real (true fact)</option>
                        <option value="Fake">Fake (false fact)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="font-mono text-[9px] text-gray-400 tracking-[0.3em] block mb-2 uppercase">POST_EXECUTION_LOG (Explanation)</label>
                <input value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Details revealed post-execution..."
                  className="w-full bg-dark-950 border border-white/10 text-white font-body text-sm px-5 py-4 focus:outline-none focus:border-gdg-blue transition-colors" />
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-white/10">
                <button type="submit" disabled={saving} className="clip-angled bg-gdg-blue/10 hover:bg-gdg-blue border border-gdg-blue/50 text-gdg-blue hover:text-white px-10 py-4 flex-1 font-display font-black tracking-[0.3em] uppercase transition-all hover:shadow-[0_0_20px_rgba(66,133,244,0.4)] disabled:opacity-50">
                  {saving ? 'UPLOADING...' : editing ? 'UPDATE_PAYLOAD' : 'COMMIT_PAYLOAD'}
                </button>
                {editing && <button type="button" onClick={resetForm} className="clip-angled bg-dark-950 hover:bg-white/5 border border-white/10 text-gray-400 px-10 py-4 font-display font-black tracking-[0.3em] uppercase transition-colors">ABORT</button>}
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4 pt-4">
          <div className="font-mono font-bold text-gray-500 text-[10px] tracking-[0.3em] mb-6 border-b border-white/10 pb-4 flex items-center justify-between uppercase">
            <span>{filterRound ? `PHASE_0${filterRound}_PAYLOADS` : 'ALL_STORED_PAYLOADS'}</span>
            <span className="bg-dark-950 px-4 py-1 border border-white/5 clip-hex">{filtered.length} NODES</span>
          </div>
          
          {loading ? (
            <div className="text-center py-20 border border-white/5 bg-dark-900/50 clip-angled">
              <span className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin inline-block mb-4 shadow-[0_0_15px_rgba(66,133,244,0.5)]"></span>
              <div className="font-mono text-[10px] text-gdg-blue tracking-[0.3em] uppercase">Syncing payloads...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 border border-white/5 border-dashed bg-dark-900/50 clip-angled">
              <div className="text-5xl mb-6 opacity-30 grayscale">📭</div>
              <div className="font-mono text-gray-500 text-[10px] tracking-[0.4em] mb-2 uppercase">No queries detected.</div>
            </div>
          ) : filtered.map((q, idx) => (
            <div key={q._id} className={`clip-angled tech-border p-6 hover:-translate-x-2 transition-all relative group bg-dark-900/80 hover:bg-dark-900 border-l-[3px] border-l-${ROUND_COLORS[q.round]}`}>
              <div className={`absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-${ROUND_COLORS[q.round]}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className={`flex-shrink-0 font-mono text-[9px] font-bold px-3 py-1 bg-dark-950 border uppercase tracking-widest border-${ROUND_COLORS[q.round]} text-${ROUND_COLORS[q.round]}`}>
                  PHASE_0{q.round} {q.type === 'match' ? '(MATCH)' : '(MCQ)'}
                </div>
                <div className="flex-1 min-w-0 w-full relative z-10">
                  {q.emojiClue && <div className="text-4xl mb-4 tracking-[0.3em] drop-shadow-md">{q.emojiClue}</div>}
                  <div className="font-body text-white font-bold text-lg mb-4 leading-relaxed tracking-wide">{q.question}</div>
                  
                  {q.type === 'match' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 bg-dark-950 p-5 border border-white/5 clip-angled">
                      {q.matchPairs?.map((pair, i) => (
                        <div key={i} className="font-mono text-xs px-4 py-3 border border-white/5 bg-dark-900 text-gray-300">
                          {pair.left} <span className="text-gdg-blue mx-2">→</span> {pair.right}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 bg-dark-950 p-5 border border-white/5 clip-angled">
                      {q.options?.map((opt, i) => (
                        <div key={i} className={`font-mono text-xs px-4 py-3 flex items-center gap-3 border transition-colors ${opt === q.correctAnswer ? 'border-gdg-green bg-gdg-green/10 text-white font-bold shadow-[0_0_10px_rgba(52,168,83,0.1)]' : 'border-white/5 text-gray-400 bg-dark-900'}`}>
                          <span className={`opacity-50 text-[10px] ${opt === q.correctAnswer ? 'text-gdg-green' : ''}`}>[{['A','B','C','D'][i]}]</span> {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && <div className="font-mono text-[9px] text-gray-400 border-l-2 border-gdg-blue/50 pl-4 py-2 bg-gdg-blue/5 tracking-wider uppercase">LOG: {q.explanation}</div>}
                </div>
                <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 w-full md:w-auto justify-end md:justify-start border-t md:border-t-0 border-white/10 pt-4 md:pt-0 relative z-10">
                  <div className="font-mono text-[9px] text-gdg-blue text-center px-4 py-2 bg-dark-950 flex-1 md:flex-none border border-white/5 uppercase tracking-[0.3em] clip-hex">{q.basePoints} CYC</div>
                  <button onClick={() => startEdit(q)} className="font-mono text-[10px] tracking-[0.3em] text-white hover:bg-white/10 px-4 py-3 border border-white/20 transition-colors uppercase flex-1 md:flex-none clip-angled">EDIT</button>
                  <button onClick={() => deleteQuestion(q._id, q.question)} className="font-mono text-[10px] tracking-[0.3em] text-gdg-red hover:bg-gdg-red border border-gdg-red/30 hover:text-white px-4 py-3 transition-colors uppercase flex-1 md:flex-none clip-angled">DEL</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
