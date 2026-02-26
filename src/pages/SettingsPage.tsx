import { motion } from 'framer-motion';
import { Store, Printer, Palette, User, ChevronRight, Bell, Shield, Globe, LogOut } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';

const SettingsPage = () => {
  const { signOut, user } = useAuth();

  const settingsGroups = [
    {
      title: 'Business',
      items: [
        { icon: Store, label: 'Business Profile', desc: 'Name, logo, GST' },
        { icon: Printer, label: 'Printer Settings', desc: 'Paper size, layout' },
        { icon: Palette, label: 'Theme', desc: 'Colors and style' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', desc: user?.email || 'Name, email, password' },
        { icon: Bell, label: 'Notifications', desc: 'Alerts and updates' },
        { icon: Shield, label: 'Security', desc: 'Two-factor, sessions' },
        { icon: Globe, label: 'Language', desc: 'App language' },
      ],
    },
  ];

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-2xl mx-auto space-y-6 pb-8">
      <PageHeader title="Settings" />

      {settingsGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{group.title}</p>
          <div className="rounded-2xl glass-card shadow-soft overflow-hidden divide-y divide-border">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={signOut}
        className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </motion.button>
    </div>
  );
};

export default SettingsPage;
