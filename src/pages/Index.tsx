import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Car, Wrench, Zap, BarChart3, ScanLine, Printer, ChevronRight, Star, Shield,
  ShoppingCart, Pill, Laptop, Shirt, Apple, Coffee, Scissors, BookOpen,
  Hammer, Heart, Search, Users, Receipt, Globe, ArrowRight, Check, Sparkles,
  Store, Phone, Mail, MapPin
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
  { icon: Printer, title: 'Thermal Printing', desc: 'Connect Ezo Bluetooth printer for instant receipt printing with your branding' },
  { icon: BarChart3, title: 'Smart Reports', desc: 'Revenue analytics, daily/weekly/monthly trends, and inventory insights' },
  { icon: Shield, title: 'Cloud Secured', desc: 'All your business data is encrypted and backed up in the cloud automatically' },
  { icon: Users, title: 'Customer CRM', desc: 'Auto-save customer profiles, track visits, spending history and vehicle info' },
  { icon: Globe, title: 'Online Store', desc: 'Get a unique public store link to share your product catalog with customers' },
];

const testimonials = [
  { name: 'Rajesh Kumar', biz: 'AutoSpa Car Wash', text: 'ZEN POS completely transformed our billing. Barcode scanning and thermal printing saves us 30 minutes daily!' },
  { name: 'Priya Sharma', biz: 'Krishna Grocery', text: 'Managing 500+ products was a nightmare. Now I scan, bill, and track everything from my phone.' },
  { name: 'Ahmed Khan', biz: 'TechZone Electronics', text: 'The customer management feature helps me remember every customer. My repeat business is up 40%!' },
];

const pricingFeatures = [
  'Unlimited Products & Services',
  'Barcode Scanner & Printer Support',
  'Customer Management & CRM',
  'Online Store Page',
  'Revenue Reports & Analytics',
  'WhatsApp Bill Sharing',
  'Multi-Category Support',
  'Cloud Backup & Security',
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (!loading && user) { navigate('/', { replace: true }); }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black 20%, transparent 75%)',
      }} />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80" style={{ background: 'linear-gradient(180deg, hsl(var(--primary) / 0.1), transparent)' }} />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-4 md:px-8 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display text-foreground">ZEN <span className="gradient-primary-text">POS</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
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
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <section className="pt-12 pb-16 md:pt-20 md:pb-24 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Free for All Businesses
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-foreground leading-tight">
              Smart POS for <br className="hidden md:block" />
              <span className="gradient-primary-text">Every Business</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mt-4">
              Billing, inventory, customer management and analytics — all in one app.
              Perfect for car washes, grocery stores, electronics shops, cafés, salons, and more.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2">
              Start Free <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2">
              See Features <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="flex items-center justify-center gap-8 pt-6 text-center">
            {[
              { val: '12+', label: 'Business Types' },
              { val: '∞', label: 'Products' },
              { val: 'Free', label: 'Forever' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold font-display gradient-primary-text">{s.val}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Store Categories */}
        <section id="categories" className="py-12 md:py-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Works for Every Store</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">No matter what you sell — products or services — ZEN POS adapts to your business type</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {storeCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="rounded-2xl glass-card shadow-soft p-4 text-center space-y-2 hover:shadow-elevated transition-shadow cursor-pointer group"
                  onClick={() => navigate('/auth')}>
                  <div className={`w-11 h-11 mx-auto rounded-xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{cat.name}</p>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground">+ Custom categories for any other business type</p>
        </section>

        {/* Features */}
        <section id="features" className="py-12 md:py-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Powerful Features</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Everything you need to run your business efficiently from day one</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="rounded-2xl glass-card shadow-soft p-5 space-y-3 hover:shadow-elevated transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* How it Works */}
        <section className="py-12 md:py-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Get Started in Minutes</h2>
            <p className="text-sm text-muted-foreground">3 simple steps to digitize your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Sign Up Free', desc: 'Create your account with email or Google. No credit card needed.' },
              { step: '02', title: 'Setup Store', desc: 'Choose your business category, add products from gallery or manually.' },
              { step: '03', title: 'Start Billing', desc: 'Scan barcodes, create invoices, share on WhatsApp, print receipts.' },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-2xl glass-card shadow-soft p-5 space-y-3 text-center">
                <span className="text-3xl font-bold font-display gradient-primary-text">{s.step}</span>
                <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Loved by Business Owners</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-2xl glass-card shadow-soft p-5 space-y-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-warning fill-warning" />)}
                </div>
                <p className="text-sm text-foreground italic leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="text-xs font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.biz}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12 md:py-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Simple Pricing</h2>
            <p className="text-sm text-muted-foreground">Free forever. No hidden charges.</p>
          </div>
          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl glass-card shadow-soft p-6 space-y-4 border-2 border-primary/20">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Free Plan</p>
                <p className="text-4xl font-bold font-display text-foreground">₹0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              </div>
              <div className="space-y-2.5">
                {pricingFeatures.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary">
                Get Started Free
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Find Store Search */}
        <section className="py-12 md:py-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Find a Store</h2>
            <p className="text-sm text-muted-foreground">Search for businesses using ZEN POS</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Enter store name or link..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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

        {/* Contact */}
        <section id="contact" className="py-12 md:py-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Contact Us</h2>
            <p className="text-sm text-muted-foreground">Have questions? We're here to help.</p>
          </div>
          <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Phone, label: 'Call Us', value: '+91 98765 43210' },
              { icon: Mail, label: 'Email', value: 'hello@zenpos.in' },
              { icon: MapPin, label: 'Location', value: 'India' },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="rounded-2xl glass-card shadow-soft p-4 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl gradient-primary p-8 md:p-12 text-center space-y-4 glow-primary">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-primary-foreground">Ready to Simplify Your Business?</h2>
            <p className="text-primary-foreground/80 text-sm max-w-md mx-auto">Join thousands of business owners who use ZEN POS to save time, increase revenue, and delight customers.</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
              className="px-8 py-3 rounded-xl bg-primary-foreground text-primary font-bold text-sm">
              Start Free Today
            </motion.button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold font-display text-foreground">ZEN POS</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 ZEN POS. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
