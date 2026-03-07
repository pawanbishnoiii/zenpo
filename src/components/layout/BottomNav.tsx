import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, Settings, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBusiness } from '@/hooks/useBusiness';
import { getCategoryConfig } from '@/lib/categoryConfig';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { business } = useBusiness();
  const config = business ? getCategoryConfig(business.category) : null;

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: config?.navLabel.home || 'Home' },
    { path: '/workspace', icon: Package, label: config?.navLabel.workspace || 'Workspace' },
    { path: '/billing', icon: Receipt, label: config?.navLabel.billing || 'Billing' },
    { path: '/settings', icon: Settings, label: config?.navLabel.settings || 'Settings' },
  ];

  return (
    <>
      <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => navigate('/billing')}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-primary shadow-elevated glow-primary flex items-center justify-center lg:bottom-6">
        <ScanLine className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/50 safe-bottom lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <motion.button key={item.path} whileTap={{ scale: 0.9 }} onClick={() => navigate(item.path)} className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 relative">
                {isActive && <motion.div layoutId="activeTab" className="absolute -top-1 w-8 h-1 rounded-full gradient-primary" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 gap-2 glass-card border-r border-border/50 z-40">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-6"><Receipt className="w-5 h-5 text-primary-foreground" /></div>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <motion.button key={item.path} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors w-16 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <Icon className="w-5 h-5" /><span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNav;
