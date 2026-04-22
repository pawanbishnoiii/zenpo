import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sun, Moon, LogOut, Settings as SettingsIcon, Shield, ChevronRight, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

const ProfileButton = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { business } = useBusiness();
  const { isDark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-menu]')) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const initials = (business?.business_name || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <div className="relative" data-profile-menu>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm flex items-center justify-center shadow-soft">
        {initials}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute right-0 top-12 w-72 z-50 rounded-2xl bg-card border border-border shadow-elevated overflow-hidden">
            {/* Profile card */}
            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold flex items-center justify-center">{initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{business?.business_name || 'Your Business'}</p>
                  <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1"><Mail className="w-3 h-3" />{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Theme toggle */}
            <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2.5">
                {isDark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
                <span className="text-sm font-semibold text-foreground">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <span className={`w-9 h-5 rounded-full relative transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isDark ? 'left-[18px]' : 'left-0.5'}`} />
              </span>
            </button>

            <div className="border-t border-border" />

            <button onClick={() => { setOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm">
              <SettingsIcon className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Settings</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
            </button>
            <button onClick={() => { setOpen(false); navigate('/store-manager'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm">
              <User className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Store Manager</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
            </button>
            {isAdmin && (
              <button onClick={() => { setOpen(false); navigate('/admin'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-destructive/5 transition-colors text-sm">
                <Shield className="w-4 h-4 text-destructive" /><span className="text-destructive font-semibold">Admin Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-destructive ml-auto" />
              </button>
            )}

            <div className="border-t border-border" />
            <button onClick={() => { setOpen(false); signOut(); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-destructive/5 transition-colors text-sm text-destructive font-semibold">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileButton;
