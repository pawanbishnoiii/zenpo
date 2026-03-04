import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Car, Wrench, Zap, BarChart3, ScanLine, Printer, ChevronRight, Star, Shield } from 'lucide-react';

const features = [
  { icon: ScanLine, title: 'Barcode Scanner', desc: 'Instant scan & bill with camera' },
  { icon: Printer, title: 'Ezo Printer', desc: 'Bluetooth thermal receipt printing' },
  { icon: BarChart3, title: 'Smart Reports', desc: 'Revenue analytics & insights' },
  { icon: Shield, title: 'Secure Data', desc: 'Cloud-backed business data' },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (!loading && user) {
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
      }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-60" style={{ background: 'linear-gradient(180deg, hsl(var(--primary) / 0.12), transparent)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-8">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center glow-primary"
          >
            <Zap className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground">
            ZEN <span className="gradient-primary-text">POS</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Smart billing, inventory & customer management for Car Wash Centers & Spare Parts shops
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
              className="px-8 py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center gap-2"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')}
              className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm"
            >
              Login
            </motion.button>
          </div>
        </motion.div>

        {/* Business Types */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl glass-card shadow-soft p-5 space-y-3 border-2 border-primary/10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Car Wash Center</h3>
            <p className="text-xs text-muted-foreground">Foam wash, detailing, polish — service-based billing with vehicle tracking</p>
          </div>
          <div className="rounded-2xl glass-card shadow-soft p-5 space-y-3 border-2 border-accent/10">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Spare Parts & Mods</h3>
            <p className="text-xs text-muted-foreground">Inventory management, barcode scanning, parts billing with labour charges</p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
          <h2 className="text-lg font-bold font-display text-foreground text-center">Why ZEN POS?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                  className="rounded-2xl glass-card shadow-soft p-4 text-center space-y-2"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-foreground">{f.title}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
          <div className="rounded-2xl glass-card shadow-soft p-6 text-center space-y-3">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-warning fill-warning" />)}
            </div>
            <p className="text-sm text-foreground italic">"ZEN POS ne humari car wash shop ka billing system completely transform kar diya. Easy to use aur fast!"</p>
            <p className="text-xs text-muted-foreground">— Rajesh, AutoSpa Car Wash</p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center pb-8 space-y-2">
          <p className="text-xs text-muted-foreground">© 2026 ZEN POS. Smart business, simplified.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
