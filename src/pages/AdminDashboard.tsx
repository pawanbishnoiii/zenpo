import { motion } from 'framer-motion';
import { Users, Store, Package, Receipt, Shield, TrendingUp, Settings } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, businesses: 0, products: 0, invoices: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [users, businesses, products, invoices] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        users: users.count || 0,
        businesses: businesses.count || 0,
        products: products.count || 0,
        invoices: invoices.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
    { title: 'Businesses', value: stats.businesses, icon: Store, color: 'text-accent' },
    { title: 'Products', value: stats.products, icon: Package, color: 'text-success' },
    { title: 'Invoices', value: stats.invoices, icon: Receipt, color: 'text-warning' },
  ];

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Admin Panel"
        actions={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10">
            <Shield className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs font-bold text-destructive">Admin</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass-card shadow-soft p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-muted-foreground font-medium">{card.title}</span>
              </div>
              <p className="text-2xl font-bold font-display text-foreground">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Admin Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Quick Actions</p>
        <div className="rounded-2xl glass-card shadow-soft overflow-hidden divide-y divide-border">
          {[
            { icon: Users, label: 'Manage Users', desc: 'View all registered users' },
            { icon: Store, label: 'Manage Businesses', desc: 'View all businesses' },
            { icon: TrendingUp, label: 'Revenue Reports', desc: 'Global analytics' },
            { icon: Settings, label: 'System Settings', desc: 'Platform configuration' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
