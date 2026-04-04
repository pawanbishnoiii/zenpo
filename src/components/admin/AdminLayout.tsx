import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Package, Store, Users, Mail, Bell, Settings, Activity, Shield, ChevronLeft, ChevronRight, CreditCard, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { path: '/admin', icon: BarChart3, label: 'Overview' },
  { path: '/admin/gallery', icon: Package, label: 'Gallery' },
  { path: '/admin/stores', icon: Store, label: 'Stores' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/smtp', icon: Mail, label: 'SMTP' },
  { path: '/admin/alerts', icon: Bell, label: 'Alerts' },
  { path: '/admin/features', icon: Settings, label: 'Features' },
  { path: '/admin/analytics', icon: Activity, label: 'Analytics' },
  { path: '/admin/subscriptions', icon: CreditCard, label: 'Plans' },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-destructive" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">Ezo Admin</p>
            <p className="text-[10px] text-muted-foreground">Super Admin Panel</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 space-y-1 border-t border-border">
        <button onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
          <ChevronLeft className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>Back to App</span>}
        </button>
        <button onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10">
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 m-2 rounded-lg hover:bg-muted text-muted-foreground">
          {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : <ChevronLeft className="w-4 h-4 mx-auto" />}
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted"><Menu className="w-5 h-5 text-foreground" /></button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-destructive" />
              <span className="text-sm font-bold text-foreground">Ezo Admin</span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} className="w-64 bg-card border-r border-border flex flex-col relative z-10">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-foreground" />
              </button>
              <SidebarContent />
            </motion.div>
            <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
