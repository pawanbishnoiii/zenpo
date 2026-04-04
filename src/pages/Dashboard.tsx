import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { IndianRupee, Package, TrendingUp, AlertTriangle, LogOut, Shield, Receipt, Users, Tag, BarChart3, Settings, Globe, ExternalLink, Palette, MessageCircle, QrCode, Share2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryConfig } from '@/lib/categoryConfig';

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { business } = useBusiness();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ todaySales: 0, monthlySales: 0, totalProducts: 0, lowStock: 0, totalCustomers: 0, totalInvoices: 0, activeOffers: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);

  const categoryConfig = business ? getCategoryConfig(business.category) : null;
  const CategoryIcon = categoryConfig?.icon || Package;

  useEffect(() => {
    if (!business) return;
    const fetchDashboardData = async () => {
      const today = dayjs().startOf('day').toISOString();
      const monthStart = dayjs().startOf('month').toISOString();

      const [todayInv, monthInv, prods, custs, allInv, offers] = await Promise.all([
        supabase.from('invoices').select('grand_total').eq('business_id', business.id).gte('created_at', today),
        supabase.from('invoices').select('grand_total').eq('business_id', business.id).gte('created_at', monthStart),
        supabase.from('products').select('id, stock').eq('business_id', business.id),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
        supabase.from('business_offers').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('is_active', true),
      ]);

      const todaySales = (todayInv.data || []).reduce((s, i) => s + Number(i.grand_total), 0);
      const monthlySales = (monthInv.data || []).reduce((s, i) => s + Number(i.grand_total), 0);
      const lowStock = (prods.data || []).filter(p => p.stock < 20).length;

      setStats({ todaySales, monthlySales, totalProducts: prods.data?.length || 0, lowStock, totalCustomers: custs.count || 0, totalInvoices: allInv.count || 0, activeOffers: offers.count || 0 });

      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const d = dayjs().subtract(i, 'day');
        const dayStart = d.startOf('day').toISOString();
        const dayEnd = d.endOf('day').toISOString();
        const { data: dayInv } = await supabase.from('invoices').select('grand_total').eq('business_id', business.id).gte('created_at', dayStart).lte('created_at', dayEnd);
        weekData.push({ name: d.format('ddd'), revenue: (dayInv || []).reduce((s, inv) => s + Number(inv.grand_total), 0) });
      }
      setRevenueData(weekData);
    };
    fetchDashboardData();
  }, [business?.id]);

  const storeUrl = business?.store_slug ? `${window.location.origin}/store/${business.store_slug}` : '';

  // Dynamic quick actions based on category
  const getQuickActions = () => {
    const base = [
      { icon: Package, label: categoryConfig?.navLabel.workspace || 'Workspace', desc: 'Manage products', path: '/workspace' },
      { icon: IndianRupee, label: categoryConfig?.navLabel.billing || 'New Bill', desc: 'Create invoice', path: '/billing' },
      { icon: Receipt, label: 'History', desc: 'Past invoices', path: '/history' },
      { icon: Users, label: categoryConfig?.navLabel.customers || 'Customers', desc: 'Customer CRM', path: '/customers' },
      { icon: Tag, label: 'Offers', desc: 'Discounts & coupons', path: '/offers' },
      { icon: BarChart3, label: 'Reports', desc: 'Analytics', path: '/reports' },
      { icon: Globe, label: 'Store', desc: 'Public page', path: storeUrl ? `/store/${business?.store_slug}` : '/settings' },
      { icon: Settings, label: 'Settings', desc: 'Configuration', path: '/settings' },
    ];
    return base;
  };

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground font-medium">{dayjs().format('dddd, D MMMM YYYY')}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold font-display text-foreground">{business?.business_name || 'Dashboard'}</motion.h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/admin')} className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"><Shield className="w-4 h-4 text-destructive" /></motion.button>}
          <motion.button whileTap={{ scale: 0.95 }} onClick={signOut} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><LogOut className="w-4 h-4 text-foreground" /></motion.button>
        </div>
      </div>

      {categoryConfig && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <CategoryIcon className="w-3.5 h-3.5" />
            {categoryConfig.name}
          </div>
          {storeUrl && (
            <button onClick={() => window.open(storeUrl, '_blank')} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
              <Globe className="w-3 h-3" /> Store <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Today Sales" value={`₹${stats.todaySales.toLocaleString()}`} icon={IndianRupee} trend={stats.todaySales > 0 ? 'Live' : 'No sales'} trendUp={stats.todaySales > 0} gradient />
        <StatCard title="Monthly Sales" value={`₹${(stats.monthlySales / 1000).toFixed(1)}K`} icon={TrendingUp} trend="This month" />
        <StatCard title={categoryConfig?.navLabel.workspace === 'Services' ? 'Services' : categoryConfig?.navLabel.workspace === 'Menu' ? 'Menu Items' : 'Products'} value={stats.totalProducts.toString()} icon={Package} />
        <StatCard title="Low Stock" value={stats.lowStock.toString()} icon={AlertTriangle} trend={stats.lowStock > 0 ? 'Attention' : 'Good'} />
      </div>

      {/* Quick Stats Row */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
        {[
          { label: categoryConfig?.navLabel.customers || 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-success' },
          { label: 'Invoices', value: stats.totalInvoices, icon: Receipt, color: 'text-primary' },
          { label: 'Active Offers', value: stats.activeOffers, icon: Tag, color: 'text-warning' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="min-w-[120px] rounded-2xl glass-card shadow-soft p-3 space-y-1">
              <Icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-lg font-bold font-display text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {revenueData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl glass-card shadow-soft p-4">
          <h2 className="text-sm font-semibold mb-4 text-foreground">Revenue This Week</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
        {getQuickActions().map(item => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => item.path.startsWith('/store') ? window.open(item.path, '_blank') : navigate(item.path)}
              className="p-4 rounded-2xl glass-card shadow-soft text-left hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2"><Icon className="w-5 h-5 text-primary" /></div>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Dashboard;
