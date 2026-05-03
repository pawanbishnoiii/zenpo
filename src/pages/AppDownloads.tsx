import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Download, ArrowLeft, Smartphone, Apple, Loader2, Zap, Check, Calendar, HardDrive, Tag } from 'lucide-react';

const VIOLET = '#8B5CF6'; const CYAN = '#06B6D4'; const EMERALD = '#10B981';

const formatSize = (b: number) => {
  if (!b) return '—';
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  return (b / 1024).toFixed(0) + ' KB';
};

const AppDownloads = () => {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    supabase.from('app_releases').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setReleases(data || []); setLoading(false); });
  }, []);

  const handleDownload = (r: any) => {
    setDownloading(r.id); setProgress(0);
    const tick = setInterval(() => setProgress(p => Math.min(95, p + Math.random() * 14)), 220);
    const a = document.createElement('a');
    a.href = r.apk_url; a.download = `${r.app_name || 'Zenpoo'}-${r.version}.apk`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => { clearInterval(tick); setProgress(100); setTimeout(() => setDownloading(null), 1200); }, 2200);
  };

  const latest = releases[0];

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: '#050508' }}>
      {/* Bg orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
          style={{ background: `radial-gradient(circle,${VIOLET},transparent 70%)` }} />
        <motion.div animate={{ x: [0, -60, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full blur-3xl opacity-25"
          style={{ background: `radial-gradient(circle,${CYAN},transparent 70%)` }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <motion.div animate={{ rotateY: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-2xl"
            style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN},${EMERALD})`, boxShadow: `0 20px 60px -10px ${VIOLET}` }}>
            <Zap className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
            Download <span style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zenpoo</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">All apps in one place. Pick your version. Built for Android, optimized for everyone.</p>
        </motion.div>

        {/* Latest hero card */}
        {latest && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="relative rounded-3xl overflow-hidden p-8 mb-8 border border-white/10 backdrop-blur-xl"
            style={{ background: `linear-gradient(135deg, ${VIOLET}20, ${CYAN}10)` }}>
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase"
              style={{ background: `linear-gradient(135deg,${EMERALD},${CYAN})` }}>Latest · v{latest.version}</div>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">{latest.app_name || 'Zenpoo'}</h2>
                <p className="text-slate-300 text-sm mb-4">{latest.changelog || 'Bug fixes, performance improvements & new features.'}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-5">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(latest.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> {formatSize(latest.file_size)}</span>
                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Android 7+</span>
                </div>
                <button onClick={() => handleDownload(latest)} disabled={downloading === latest.id}
                  className="relative w-full md:w-auto px-8 py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 overflow-hidden"
                  style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})`, boxShadow: `0 10px 40px -10px ${VIOLET}` }}>
                  <AnimatePresence mode="wait">
                    {downloading === latest.id ? (
                      <motion.div key="dl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 relative z-10">
                        <Loader2 className="w-5 h-5 animate-spin" /> Downloading {Math.round(progress)}%
                      </motion.div>
                    ) : (
                      <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 relative z-10">
                        <Download className="w-5 h-5" /> Download APK
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {downloading === latest.id && (
                    <motion.div className="absolute inset-y-0 left-0 bg-white/20" style={{ width: `${progress}%` }} />
                  )}
                </button>
              </div>
              {/* Android branding illustration */}
              <div className="flex items-center justify-center">
                <motion.svg width="180" height="180" viewBox="0 0 100 100" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <defs><linearGradient id="andg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor={EMERALD} /><stop offset="100%" stopColor={CYAN} /></linearGradient></defs>
                  <path d="M30 60 Q30 40 50 40 Q70 40 70 60 L70 75 Q70 78 67 78 L33 78 Q30 78 30 75 Z" fill="url(#andg)" />
                  <circle cx="42" cy="55" r="2.5" fill="white" /><circle cx="58" cy="55" r="2.5" fill="white" />
                  <line x1="35" y1="38" x2="40" y2="32" stroke="url(#andg)" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="65" y1="38" x2="60" y2="32" stroke="url(#andg)" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="20" y="55" width="6" height="20" rx="3" fill="url(#andg)" />
                  <rect x="74" y="55" width="6" height="20" rx="3" fill="url(#andg)" />
                  <rect x="38" y="80" width="5" height="14" rx="2.5" fill="url(#andg)" />
                  <rect x="57" y="80" width="5" height="14" rx="2.5" fill="url(#andg)" />
                </motion.svg>
              </div>
            </div>
          </motion.div>
        )}

        {/* All releases */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">All Releases</h3>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
        ) : releases.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No releases yet. Coming soon.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {releases.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone className="w-4 h-4 text-violet-400" />
                      <span className="font-bold">{r.app_name || 'Zenpoo'}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">v{r.version}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex gap-3">
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      <span>{formatSize(r.file_size)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDownload(r)}
                    className="p-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                {r.changelog && <p className="text-xs text-slate-400 line-clamp-2">{r.changelog}</p>}
              </motion.div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
          {[
            { i: '⚡', t: 'Lightning Fast' }, { i: '🔒', t: 'Secure & Encrypted' },
            { i: '📱', t: 'Mobile Optimized' }, { i: '☁️', t: 'Cloud Synced' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
              className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl mb-1">{f.i}</div>
              <div className="text-xs text-slate-300">{f.t}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppDownloads;
