import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRef } from 'react';
import {
  Car, Wrench, Zap, BarChart3, ScanLine, Printer, ChevronRight, Star, Shield,
  ShoppingCart, Pill, Laptop, Shirt, Apple, Coffee, Scissors, BookOpen,
  Hammer, Heart, Search, Users, Receipt, Globe, ArrowRight, Check, Sparkles,
  Store, Phone, Mail, MapPin, MessageSquare, Smartphone, Clock, Lock,
  Layers, TrendingUp, Eye, Play, ChevronDown, Award, Wifi, Database
} from 'lucide-react';

const storeCategories = [
  { icon: Car, name: 'Car Wash', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Wrench, name: 'Auto Parts', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: ShoppingCart, name: 'Grocery', color: 'text-green-500', bg: 'bg-green-500/10' },
  { icon: Pill, name: 'Medical', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: Laptop, name: 'Electronics', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { icon: Shirt, name: 'Fashion', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { icon: Apple, name: 'Fruits & Veg', color: 'text-lime-500', bg: 'bg-lime-500/10' },
  { icon: Coffee, name: 'Café', color: 'text-amber-600', bg: 'bg-amber-600/10' },
  { icon: Scissors, name: 'Salon', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
  { icon: Hammer, name: 'Hardware', color: 'text-slate-500', bg: 'bg-slate-500/10' },
  { icon: BookOpen, name: 'Stationery', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { icon: Heart, name: 'Pet Store', color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

const features = [
  { icon: ScanLine, title: 'Barcode Scanner', desc: 'Scan product barcodes with camera to instantly add items to billing or inventory' },
  { icon: Printer, title: 'Multi-Printer Support', desc: 'Connect Epson, Canon, HP, SUNMI, Samsung and more printers for instant receipt printing' },
  { icon: BarChart3, title: 'Smart Reports', desc: 'Revenue analytics, daily/weekly/monthly trends, and inventory insights' },
  { icon: Shield, title: 'Cloud Secured', desc: 'All your business data is encrypted and backed up in the cloud automatically' },
  { icon: Users, title: 'Customer CRM', desc: 'Auto-save customer profiles, track visits, spending history and vehicle info' },
  { icon: Globe, title: 'Online Store', desc: 'Get a unique public store link with 5 beautiful themes to share your catalog' },
  { icon: Smartphone, title: 'Mobile Optimized', desc: 'Use billing, workspace and dashboard on phone with touch-optimized interface' },
  { icon: MessageSquare, title: 'WhatsApp Sharing', desc: 'Share bills, store links and receipts directly via WhatsApp' },
  { icon: Lock, title: 'Admin Controls', desc: 'Central admin dashboard to manage all businesses, users and platform features' },
];

const testimonials = [
  { name: 'Rajesh Kumar', biz: 'AutoSpa Car Wash', text: 'ZEN POS completely transformed our billing. Barcode scanning and thermal printing saves us 30 minutes daily!', avatar: '🚗' },
  { name: 'Priya Sharma', biz: 'Krishna Grocery', text: 'Managing 500+ products was a nightmare. Now I scan, bill, and track everything from my phone.', avatar: '🛒' },
  { name: 'Ahmed Khan', biz: 'TechZone Electronics', text: 'The customer management feature helps me remember every customer. My repeat business is up 40%!', avatar: '💻' },
  { name: 'Dr. Meena', biz: 'LifeCare Pharmacy', text: 'Expiry tracking and batch management has been a game changer for our pharmacy. No more expired stock losses.', avatar: '💊' },
  { name: 'Sunita Devi', biz: 'Style Studio Salon', text: 'Appointment booking and service tracking makes managing my salon so much easier. Clients love the online store!', avatar: '✂️' },
  { name: 'Ravi Patel', biz: 'Fresh Farm Veggies', text: 'Weight-based billing is perfect for my vegetable shop. Daily price updates are so simple now.', avatar: '🥬' },
];

const pricingFeatures = [
  'Unlimited Products & Services', 'Barcode Scanner & Multi-Printer Support', 'Customer Management & CRM',
  'Online Store with 5 Themes', 'Revenue Reports & Analytics', 'WhatsApp Bill Sharing',
  'Multi-Category Dashboard', 'Cloud Backup & Security', 'Email Notifications', 'SMTP Integration',
];

const howItWorks = [
  { step: '01', title: 'Sign Up Free', desc: 'Create your account with email. No credit card needed.', icon: Users },
  { step: '02', title: 'Choose Category', desc: 'Select your business type from 12+ categories for a customized experience.', icon: Layers },
  { step: '03', title: 'Add Products', desc: 'Pick from pre-built gallery or add manually. Scan barcodes to add instantly.', icon: ScanLine },
  { step: '04', title: 'Start Billing', desc: 'Create invoices, print receipts, share on WhatsApp. All from your phone.', icon: Receipt },
];

const platformStats = [
  { val: '12+', label: 'Business Types', icon: Store },
  { val: '60+', label: 'Pre-built Products', icon: Database },
  { val: '9+', label: 'Printer Brands', icon: Printer },
  { val: '5', label: 'Store Themes', icon: Eye },
];

const AnimatedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  if (!loading && user) { navigate('/', { replace: true }); }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated Grid Background */}
      <div className="pointer-events-none fixed inset-0 opacity-15" style={{
        backgroundImage: 'linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black 20%, transparent 75%)',
      }} />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96" style={{ background: 'linear-gradient(180deg, hsl(var(--primary) / 0.12), transparent)' }} />
      
      {/* Floating orbs */}
      <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="pointer-events-none fixed top-32 left-[10%] w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }} />
      <motion.div animate={{ y: [0, 20, 0], x: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="pointer-events-none fixed top-64 right-[15%] w-48 h-48 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent)' }} />

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 15 }} className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-lg font-bold font-display text-foreground">ZEN <span className="gradient-primary-text">POS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/auth')} className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-colors">Login</button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
              className="px-5 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold glow-primary">
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* Hero Section - Enhanced */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-32 text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> Free for All Businesses — No Credit Card
            </motion.span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-foreground leading-tight">
              The Smartest <span className="gradient-primary-text">POS System</span> <br className="hidden md:block" />
              for Every Indian Business
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mt-5 leading-relaxed">
              Billing, inventory, customer management, online store, email alerts and analytics — all in one beautiful app.
              Built for car washes, grocery, medical, electronics, fashion, cafés, salons and 6+ more categories.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2 shadow-xl">
              Start Free Now <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Explore Features
            </motion.button>
          </motion.div>

          {/* Platform Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 md:gap-10 pt-8">
            {platformStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold font-display gradient-primary-text">{s.val}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="pt-4">
            <ChevronDown className="w-5 h-5 mx-auto text-muted-foreground/50" />
          </motion.div>
        </section>

        {/* Store Categories */}
        <AnimatedSection>
          <section id="categories" className="py-16 md:py-20 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">12+ Categories</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Works for Every Store</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">No matter what you sell — products or services — ZEN POS adapts to your business type with custom dashboards and workflows</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {storeCategories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.05, y: -5 }}
                    className="rounded-2xl glass-card shadow-soft p-4 text-center space-y-2 hover:shadow-elevated transition-all cursor-pointer group"
                    onClick={() => navigate('/auth')}>
                    <motion.div whileHover={{ rotate: 10 }} className={`w-12 h-12 mx-auto rounded-xl ${cat.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${cat.color}`} />
                    </motion.div>
                    <p className="text-xs font-semibold text-foreground">{cat.name}</p>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground">+ Custom Business type for any category not listed</p>
          </section>
        </AnimatedSection>

        {/* Features - 3x3 Grid */}
        <AnimatedSection>
          <section id="features" className="py-16 md:py-20 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Powerful Tools</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Everything You Need</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">From barcode scanning to SMTP email alerts, every feature is built to save you time and grow your business</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                    className="rounded-2xl glass-card shadow-soft p-5 space-y-3 hover:shadow-elevated transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        {/* How it Works */}
        <AnimatedSection>
          <section id="how-it-works" className="py-16 md:py-20 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Simple Setup</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Get Started in 3 Minutes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {howItWorks.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }} className="rounded-2xl glass-card shadow-soft p-6 space-y-3 text-center relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-8xl font-bold font-display text-primary/5">{s.step}</div>
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-xl font-bold font-display gradient-primary-text">{s.step}</span>
                    <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        {/* Dashboard Preview Mockup */}
        <AnimatedSection>
          <section className="py-16 md:py-20">
            <div className="rounded-3xl overflow-hidden border border-border/50 shadow-elevated bg-card">
              <div className="h-8 bg-secondary flex items-center gap-1.5 px-4">
                <div className="w-3 h-3 rounded-full bg-destructive/50" /><div className="w-3 h-3 rounded-full bg-warning/50" /><div className="w-3 h-3 rounded-full bg-success/50" />
                <span className="ml-4 text-[10px] text-muted-foreground font-medium">zenpos.app/dashboard</span>
              </div>
              <div className="p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Today Sales', value: '₹12,450', color: 'gradient-primary text-primary-foreground' },
                    { label: 'Monthly Revenue', value: '₹3.2L', color: 'bg-success/10 text-success' },
                    { label: 'Products', value: '284', color: 'bg-primary/10 text-primary' },
                    { label: 'Customers', value: '1,247', color: 'bg-accent/10 text-accent' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.color.includes('gradient') ? s.color : ''}`}>
                      <div className={`${s.color.includes('gradient') ? '' : s.color} rounded-xl ${s.color.includes('gradient') ? '' : 'p-4'}`}>
                        <p className={`text-xs ${s.color.includes('gradient') ? 'text-primary-foreground/70' : 'opacity-70'}`}>{s.label}</p>
                        <p className={`text-xl font-bold font-display ${s.color.includes('gradient') ? '' : ''}`}>{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary/20" />
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Testimonials */}
        <AnimatedSection>
          <section className="py-16 md:py-20 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Happy Owners</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Loved by Business Owners</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}
                  className="rounded-2xl glass-card shadow-soft p-5 space-y-3 hover:shadow-elevated transition-all">
                  <div className="flex gap-1">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-warning fill-warning" />)}</div>
                  <p className="text-sm text-foreground italic leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.avatar}</span>
                    <div><p className="text-xs font-bold text-foreground">{t.name}</p><p className="text-[10px] text-muted-foreground">{t.biz}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection>
          <section id="pricing" className="py-16 md:py-20 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Simple Pricing</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Free Forever</h2>
              <p className="text-sm text-muted-foreground">No hidden charges. No premium plans. Everything included.</p>
            </div>
            <div className="max-w-md mx-auto">
              <motion.div whileHover={{ y: -4 }}
                className="rounded-3xl glass-card shadow-elevated p-8 space-y-5 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 gradient-primary" />
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold mb-2">
                    <Award className="w-3 h-3" /> Best Value
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Free Plan</p>
                  <p className="text-5xl font-bold font-display text-foreground">₹0<span className="text-base font-normal text-muted-foreground">/month</span></p>
                </div>
                <div className="space-y-2.5">
                  {pricingFeatures.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-success" /></div>
                      <span className="text-sm text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
                  className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary">
                  Get Started Free
                </motion.button>
              </motion.div>
            </div>
          </section>
        </AnimatedSection>

        {/* Find Store */}
        <AnimatedSection>
          <section className="py-16 md:py-20 space-y-6">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Discover</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Find a Store</h2>
              <p className="text-sm text-muted-foreground">Search for businesses using ZEN POS</p>
            </div>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" placeholder="Enter store name or slug..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-soft"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) navigate(`/store/${val}`);
                    }
                  }} />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Try entering a store slug like "autospa" or "krishna-grocery"</p>
            </div>
          </section>
        </AnimatedSection>

        {/* FAQ */}
        <AnimatedSection>
          <section className="py-16 md:py-20 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-2xl mx-auto space-y-3">
              {[
                { q: 'Is ZEN POS really free?', a: 'Yes! ZEN POS is completely free with no hidden charges. All features including barcode scanning, multi-printer support, online store and analytics are included.' },
                { q: 'Can I use it on my phone?', a: 'Absolutely! ZEN POS is built mobile-first. The billing, workspace and dashboard are all optimized for phone and tablet use.' },
                { q: 'Which printers are supported?', a: 'We support Epson, Canon, HP, Samsung, SUNMI, Star Micronics, Citizen and generic thermal printers via Bluetooth, USB and WiFi.' },
                { q: 'Can I have an online store page?', a: 'Yes! Every business gets a unique public store URL with 5 beautiful themes. Customers can view products and leave reviews.' },
                { q: 'Is my data secure?', a: 'All data is encrypted and stored in the cloud with automatic backups. Row-level security ensures only you can access your business data.' },
              ].map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl glass-card shadow-soft p-5 space-y-2">
                  <h3 className="text-sm font-bold text-foreground">{faq.q}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Contact */}
        <AnimatedSection>
          <section id="contact" className="py-16 md:py-20 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Get in Touch</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Contact Us</h2>
              <p className="text-sm text-muted-foreground">Have questions? We're here to help.</p>
            </div>
            <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Phone, label: 'Call Us', value: '+91 98765 43210' },
                { icon: Mail, label: 'Email', value: 'hello@zenpos.in' },
                { icon: MapPin, label: 'Location', value: 'India' },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <motion.div key={c.label} whileHover={{ y: -3 }} className="rounded-2xl glass-card shadow-soft p-5 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                    <p className="text-xs font-bold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        {/* CTA Banner */}
        <AnimatedSection>
          <section className="py-16 md:py-20">
            <motion.div whileHover={{ scale: 1.01 }}
              className="rounded-3xl gradient-primary p-8 md:p-14 text-center space-y-5 glow-primary relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground">Ready to Simplify Your Business?</h2>
                <p className="text-primary-foreground/80 text-sm max-w-md mx-auto mt-3">Join thousands of business owners who use ZEN POS to save time, increase revenue, and delight customers.</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
                  className="mt-6 px-10 py-4 rounded-2xl bg-primary-foreground text-primary font-bold text-sm shadow-xl">
                  Start Free Today — No Credit Card
                </motion.button>
              </div>
            </motion.div>
          </section>
        </AnimatedSection>

        {/* Footer */}
        <footer className="py-10 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"><Zap className="w-4 h-4 text-primary-foreground" /></div>
                <span className="text-sm font-bold font-display text-foreground">ZEN POS</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">The smartest POS system for every Indian business. Free forever.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Product</p>
              <div className="space-y-1.5">{['Features', 'Categories', 'Pricing', 'Online Store'].map(l => <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a>)}</div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Support</p>
              <div className="space-y-1.5">{['Contact Us', 'FAQ', 'Help Center', 'Privacy Policy'].map(l => <a key={l} href="#contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a>)}</div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Connect</p>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3 h-3" /> +91 98765 43210</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="w-3 h-3" /> hello@zenpos.in</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Made in India 🇮🇳</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 ZEN POS. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Terms</span><span>Privacy</span><span>Cookies</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
