import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState, Suspense, lazy } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sparkles, ArrowRight, Star, Check, ScanLine, Boxes, BarChart3, Building2,
  Users, Bell, Download, Apple, PlayCircle, Menu, X, Zap, Shield, Globe, Smartphone,
} from 'lucide-react';

// ─────────── Theme tokens (local) ───────────
const VIOLET = '#8B5CF6';
const CYAN = '#06B6D4';
const EMERALD = '#10B981';

// ─────────── Three.js scene (lazy) ───────────
const HeroScene = lazy(() => import('@/components/landing/HeroScene'));

// ─────────── Helpers ───────────
const SectionWrap: React.FC<{ children: React.ReactNode; id?: string; className?: string }> = ({ children, id, className = '' }) => (
  <section id={id} className={`relative w-full ${className}`}>{children}</section>
);

const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
      style={{ background: `radial-gradient(circle, ${VIOLET}, transparent 70%)` }}
      animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
    <motion.div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-25"
      style={{ background: `radial-gradient(circle, ${CYAN}, transparent 70%)` }}
      animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
    <motion.div className="absolute top-1/2 left-1/3 w-[380px] h-[380px] rounded-full blur-3xl opacity-20"
      style={{ background: `radial-gradient(circle, ${EMERALD}, transparent 70%)` }}
      animate={{ x: [0, 40, 0], y: [0, -50, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
  </div>
);

const Grain = () => (
  <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.06] mix-blend-overlay z-50" aria-hidden>
    <filter id="zen-noise"><feTurbulence type="fractalNoise" baseFrequency="0.85" stitchTiles="stitch" /></filter>
    <rect width="100%" height="100%" filter="url(#zen-noise)" />
  </svg>
);

// ─────────── Custom cursor ───────────
const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[100] hidden md:block mix-blend-screen"
      animate={{ x: pos.x - 12, y: pos.y - 12 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.4 }}
      style={{ background: `radial-gradient(circle, ${VIOLET}, transparent 70%)`, boxShadow: `0 0 30px ${VIOLET}` }} />
  );
};

// ─────────── Navbar ───────────
const Navbar = ({ navigate }: { navigate: (p: string) => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [
    { label: 'Home', href: '#hero' }, { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' }, { label: 'App', href: '/app', route: true }, { label: 'Contact', href: '#footer' },
  ];
  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-black/60 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Zenpoo</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <button key={l.label} onClick={() => l.route ? navigate(l.href) : document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' })}
                className="relative text-sm text-slate-300 hover:text-white transition-colors group">
                {l.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-violet-400 group-hover:w-full group-hover:left-0 transition-all duration-300" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app')}
              className="hidden sm:flex relative items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl text-white text-sm font-semibold hover:bg-white/10 group">
              <Download className="w-4 h-4" /> Download
            </button>
            <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/95 backdrop-blur-2xl md:hidden flex flex-col items-center justify-center gap-8">
            {links.map((l, i) => (
              <motion.button key={l.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => { setOpen(false); l.route ? navigate(l.href) : document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-3xl font-bold text-white">{l.label}</motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─────────── Section 2: Hero ───────────
const Hero = ({ navigate }: { navigate: (p: string) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 8]);

  return (
    <SectionWrap id="hero" className="min-h-screen pt-24 pb-12 overflow-hidden">
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        <FloatingOrbs />
        <motion.div style={{ opacity }} className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-xs font-medium text-white">
            <Sparkles className="w-3 h-3" style={{ color: VIOLET }} />
            <span>Now Available on Android & iOS</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
            {'The Future of POS is Here'.split(' ').map((w, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: i * 0.08, duration: 0.7, ease: 'easeOut' }}
                className="inline-block mr-3">
                {i === 3 ? <span style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN},${EMERALD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{w}</span> : w}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-lg text-slate-400 max-w-xl leading-relaxed">
            Zenpoo is a modern POS, billing, inventory & business management app — built for shops, salons, cafés and service businesses. One app. Every workflow.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/app')}
              className="group relative px-6 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 overflow-hidden"
              style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})`, boxShadow: `0 10px 40px -10px ${VIOLET}` }}>
              <PlayCircle className="w-4 h-4" /> Download for Android
            </button>
            <button onClick={() => navigate('/app')}
              className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xl text-white font-semibold text-sm flex items-center gap-2 hover:bg-white/10">
              <Apple className="w-4 h-4" /> Download for iOS
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="flex items-center gap-3 pt-3">
            <div className="flex -space-x-2">
              {['🚗', '🛒', '💊', '☕', '✂️'].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-sm"
                  style={{ background: `linear-gradient(135deg, hsl(${i * 60} 70% 40%), hsl(${i * 60 + 30} 70% 30%))` }}>{e}</div>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              <div className="flex gap-0.5 text-yellow-400">{Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
              <div>Trusted by 10,000+ businesses</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div style={{ scale, filter: blur as any }} className="relative h-[420px] lg:h-[560px]">
          <Suspense fallback={<div className="w-full h-full rounded-3xl bg-gradient-to-br from-violet-900/20 to-cyan-900/20 animate-pulse" />}>
            <HeroScene />
          </Suspense>
        </motion.div>
      </div>
    </SectionWrap>
  );
};

// ─────────── Section 3: Features (horizontal on desktop, stacked mobile) ───────────
const FEATURES = [
  { icon: ScanLine, title: 'Smart POS', desc: 'Lightning fast billing with barcode scan, GST, discounts & coupons.', color: VIOLET },
  { icon: Boxes, title: 'Real-time Inventory', desc: 'Track stock, low-stock alerts, multi-image catalogue.', color: CYAN },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Revenue, profit, GST collected — daily / weekly / monthly.', color: EMERALD },
  { icon: Building2, title: 'Multi-Branch', desc: 'Manage many stores from one admin dashboard.', color: VIOLET },
  { icon: Users, title: 'Team & Roles', desc: 'Add staff, assign roles, track activity.', color: CYAN },
  { icon: Bell, title: 'Smart Notifications', desc: 'WhatsApp & SMTP receipts to every customer.', color: EMERALD },
];

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <SectionWrap id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
          Everything You <span style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Need</span>
        </motion.h2>
        <p className="text-slate-400 text-center mb-16 text-lg">Built for ambitious operators. Loved by daily users.</p>

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative rounded-3xl p-6 bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden hover:border-white/20 transition-colors">
                <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${f.color}40, transparent 60%)` }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`, border: `1px solid ${f.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrap>
  );
};

// ─────────── Section 4: Showcase ───────────
const Showcase = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yLeft = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const yRight = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 0.9]);
  return (
    <SectionWrap className="py-24 lg:py-32 overflow-hidden">
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
          See It In <span style={{ background: `linear-gradient(135deg,${VIOLET},${EMERALD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Action</span>
        </h2>
        <p className="text-slate-400 mb-16">Polished workflows for billing, inventory and analytics.</p>

        <div className="relative h-[520px] flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
              style={{ background: `radial-gradient(circle, ${VIOLET}, ${CYAN}, transparent 70%)` }} />
          </div>
          {[
            { src: 'https://placehold.co/280x580/0a0a0f/8B5CF6?text=Dashboard', y: yLeft, rot: -12, z: 10 },
            { src: 'https://placehold.co/300x620/0a0a0f/06B6D4?text=POS', scale, y: undefined, rot: 0, z: 30 },
            { src: 'https://placehold.co/280x580/0a0a0f/10B981?text=Reports', y: yRight, rot: 12, z: 10 },
          ].map((p, i) => (
            <motion.div key={i} style={{ y: p.y, scale: p.scale, rotate: p.rot, zIndex: p.z }}
              className={`absolute rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl ${i === 1 ? 'mx-0' : i === 0 ? '-translate-x-44 hidden sm:block' : 'translate-x-44 hidden sm:block'}`}>
              <img src={p.src} alt="app" className="block" loading="lazy" />
            </motion.div>
          ))}
          {/* Floating badges */}
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-4 left-4 sm:left-20 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-xs font-semibold flex items-center gap-2">
            ✓ Sale ₹2,500
          </motion.div>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
            className="absolute bottom-8 right-4 sm:right-20 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-xs font-semibold flex items-center gap-2">
            📦 Stock Alert
          </motion.div>
        </div>
      </div>
    </SectionWrap>
  );
};

// ─────────── Section 5: How it works ───────────
const Steps = () => {
  const STEPS = [
    { n: '01', t: 'Download App', d: 'Install Zenpoo from Play Store or App Store.' },
    { n: '02', t: 'Setup Your Store', d: 'Pick category, add products, customize.' },
    { n: '03', t: 'Start Selling', d: 'Bill, print, share via WhatsApp instantly.' },
  ];
  return (
    <SectionWrap className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
          Get Started in 3 Minutes
        </h2>
        <p className="text-slate-400 text-center mb-16">No setup fees. No credit card.</p>
        <div className="relative grid md:grid-cols-3 gap-6">
          <svg className="absolute top-12 left-0 w-full h-2 hidden md:block" preserveAspectRatio="none">
            <motion.line x1="0" y1="1" x2="100%" y2="1" stroke="url(#sg)" strokeWidth="2" strokeDasharray="4 8"
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2 }} />
            <defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0%" stopColor={VIOLET} /><stop offset="50%" stopColor={CYAN} /><stop offset="100%" stopColor={EMERALD} /></linearGradient></defs>
          </svg>
          {STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative rounded-3xl p-7 bg-white/[0.03] border border-white/10 backdrop-blur-xl text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-4"
                style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})` }}>{s.n}</div>
              <h3 className="text-xl font-bold text-white mb-2">{s.t}</h3>
              <p className="text-sm text-slate-400">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
};

// ─────────── Section 6: Testimonials marquee ───────────
const TESTI = [
  { n: 'Rajesh K.', biz: 'Car Wash', t: 'Saves 30 minutes daily on billing. Game changer.', e: '🚗' },
  { n: 'Priya S.', biz: 'Grocery', t: 'Manage 500+ products from my phone effortlessly.', e: '🛒' },
  { n: 'Ahmed K.', biz: 'Electronics', t: 'Customer CRM bumped repeat sales by 40%.', e: '💻' },
  { n: 'Dr. Meena', biz: 'Pharmacy', t: 'Expiry tracking ended our stock loss problem.', e: '💊' },
  { n: 'Sunita D.', biz: 'Salon', t: 'Online store + appointments — clients love it.', e: '✂️' },
  { n: 'Ravi P.', biz: 'Veggies', t: 'Weight billing is finally simple. Best app.', e: '🥬' },
  { n: 'Amit', biz: 'Café', t: 'Beautiful UI, super fast. My staff learned in 5 min.', e: '☕' },
  { n: 'Neha', biz: 'Fashion', t: 'GST reports in one tap — accountant loves it.', e: '👗' },
];

const Testimonials = () => (
  <SectionWrap className="py-24 lg:py-32 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 lg:px-8 mb-12">
      <h2 className="text-4xl md:text-5xl font-bold text-white text-center" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
        Loved by Business Owners <span className="inline-block animate-pulse">⭐</span>
      </h2>
    </div>
    {[1, -1].map((dir, row) => (
      <div key={row} className="relative overflow-hidden mb-4 group" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
        <motion.div className="flex gap-4 w-max group-hover:[animation-play-state:paused]"
          animate={{ x: dir > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
          {[...TESTI, ...TESTI].map((t, i) => (
            <div key={i} className="w-[320px] shrink-0 rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl">
              <div className="flex gap-0.5 text-yellow-400 mb-2">{Array(5).fill(0).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}</div>
              <p className="text-sm text-slate-200 mb-3">"{t.t}"</p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: `linear-gradient(135deg,${VIOLET}40,${CYAN}40)` }}>{t.e}</div>
                <div><div className="text-sm font-semibold text-white">{t.n}</div><div className="text-xs text-slate-500">{t.biz}</div></div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    ))}
  </SectionWrap>
);

// ─────────── Section 7: Pricing (dynamic) ───────────
const Pricing = ({ navigate }: { navigate: (p: string) => void }) => {
  const [yearly, setYearly] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('subscription_plans').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setPlans(data || []));
  }, []);
  return (
    <SectionWrap id="pricing" className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
          Simple, Transparent <span style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pricing</span>
        </h2>
        <p className="text-slate-400 text-center mb-10">Cancel anytime. No hidden fees.</p>
        <div className="flex justify-center mb-14">
          <div className="relative inline-flex p-1 rounded-full bg-white/[0.05] border border-white/10">
            {['Monthly', 'Yearly'].map((l, i) => (
              <button key={l} onClick={() => setYearly(i === 1)}
                className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors ${(i === 1) === yearly ? 'text-white' : 'text-slate-400'}`}>
                {l} {i === 1 && <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">−20%</span>}
              </button>
            ))}
            <motion.div className="absolute top-1 bottom-1 rounded-full"
              style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})` }}
              animate={{ left: yearly ? '50%' : 4, right: yearly ? 4 : '50%' }} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => {
            const price = yearly ? Number(p.yearly_price) : Number(p.monthly_price);
            const popular = p.is_popular;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-7 bg-white/[0.03] backdrop-blur-xl ${popular ? 'border-2 md:scale-105' : 'border border-white/10'}`}
                style={popular ? { borderImage: `linear-gradient(135deg,${VIOLET},${CYAN}) 1`, boxShadow: `0 20px 60px -20px ${VIOLET}80` } : {}}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})` }}>{p.badge || 'POPULAR'}</div>
                )}
                <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                <p className="text-sm text-slate-400 mb-5">{p.tagline}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">₹{price.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-slate-500 ml-1">/{yearly ? 'yr' : 'mo'}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {(Array.isArray(p.features) ? p.features : []).map((f: string, j: number) => (
                    <motion.li key={j} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: 0.4 + j * 0.05 }}
                      className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: EMERALD }} /> {f}
                    </motion.li>
                  ))}
                </ul>
                <button onClick={() => navigate('/auth')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm ${popular ? 'text-white' : 'text-white border border-white/15 bg-white/5 hover:bg-white/10'}`}
                  style={popular ? { background: `linear-gradient(135deg,${VIOLET},${CYAN})` } : {}}>
                  {p.cta_label || 'Get Started'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrap>
  );
};

// ─────────── Section 8: CTA banner ───────────
const CTABanner = ({ navigate }: { navigate: (p: string) => void }) => (
  <SectionWrap className="py-24">
    <motion.div initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }} whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative max-w-6xl mx-auto mx-4 lg:mx-auto rounded-[2.5rem] overflow-hidden p-10 md:p-20 text-center"
      style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN},${EMERALD})` }}>
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 20%, white, transparent 50%)' }} />
      <div className="relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Cal Sans, Inter, sans-serif' }}>
          Ready to Transform Your Business?
        </h2>
        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">Join thousands of businesses billing smarter every day.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => navigate('/app')} className="px-8 py-4 rounded-xl bg-white text-black font-bold flex items-center gap-2 hover:scale-105 transition-transform">
            <Download className="w-5 h-5" /> Get the App
          </button>
          <button onClick={() => navigate('/auth')} className="px-8 py-4 rounded-xl bg-black/30 backdrop-blur-xl border border-white/20 text-white font-bold hover:bg-black/40">
            Start Free Trial
          </button>
        </div>
      </div>
    </motion.div>
  </SectionWrap>
);

// ─────────── Section 9: Footer ───────────
const Footer = () => (
  <footer id="footer" className="border-t border-white/5 bg-black/40 py-16">
    <div className="max-w-7xl mx-auto px-4 lg:px-8 grid md:grid-cols-4 gap-10">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${VIOLET},${CYAN})` }}><Zap className="w-4 h-4 text-white" /></div>
          <span className="text-white font-bold text-lg">Zenpoo</span>
        </div>
        <p className="text-sm text-slate-400">Modern POS & business management. One app, every workflow.</p>
      </div>
      {[
        { title: 'Product', links: ['Features', 'Pricing', 'App', 'Changelog'] },
        { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
        { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
      ].map(c => (
        <div key={c.title}>
          <h4 className="text-sm font-bold text-white mb-3">{c.title}</h4>
          <ul className="space-y-2 text-sm text-slate-400">{c.links.map(l => <li key={l}><a href="#" className="hover:text-white">{l}</a></li>)}</ul>
        </div>
      ))}
    </div>
    <div className="text-center text-xs text-slate-500 mt-12">Made with ♥ by Zenpoo Team · © {new Date().getFullYear()}</div>
  </footer>
);

// ─────────── Page root ───────────
const Index = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  return (
    <div className="relative min-h-screen text-white" style={{ background: '#050508' }}>
      <Grain />
      <CustomCursor />
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 z-50 origin-left"
        style={{ scaleX: scrollYProgress, background: `linear-gradient(90deg,${VIOLET},${CYAN},${EMERALD})` }} />
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <Features />
      <Showcase />
      <Steps />
      <Testimonials />
      <Pricing navigate={navigate} />
      <CTABanner navigate={navigate} />
      <Footer />
    </div>
  );
};

export default Index;
