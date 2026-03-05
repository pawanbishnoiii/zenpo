import { motion } from 'framer-motion';
import { IndianRupee, Package, TrendingUp, AlertTriangle, Car, Wrench, LogOut, Shield, Receipt, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { business } = useBusiness();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ todaySales: 0, monthlySales: 0, totalProducts: 0, lowStock: 0, totalCustomers: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (!business) return;
    const fetchDashboardData = async () => {
      const today = dayjs().startOf('day').toISOString();
      const monthStart = dayjs().startOf('month').toISOString();

      const [todayInv, monthInv, prods, custs] = await Promise.all([
        supabase.from('invoices').select('grand_total').eq('business_id', business.id).gte('created_at', today),
        supabase.from('invoices').select('grand_total').eq('business_id', business.id).gte('created_at', monthStart),
        supabase.from('products').select('id, stock').eq('business_id', business.id),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
      ]);

      const todaySales = (todayInv.data || []).reduce((s, i) => s + Number(i.grand_total), 0);
      const monthlySales = (monthInv.data || []).reduce((s, i) => s + Number(i.grand_total), 0);
      const lowStock = (prods.data || []).filter(p => p.stock < 20).length;

      setStats({ todaySales, monthlySales, totalProducts: prods.data?.length || 0, lowStock, totalCustomers: custs.count || 0 });

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

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground font-medium">{dayjs().format('dddd, D MMMM YYYY')}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold font-display text-foreground">{business ? business.business_name : 'Dashboard'}</motion.h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/admin')} className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"><Shield className="w-4 h-4 text-destructive" /></motion.button>}
          <motion.button whileTap={{ scale: 0.95 }} onClick={signOut} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><LogOut className="w-4 h-4 text-foreground" /></motion.button>
        </div>
      </div>

      {business && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${business.category === 'car_wash' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
            {business.category === 'car_wash' ? <Car className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
            {business.category === 'car_wash' ? 'Car Wash' : 'Spare Parts'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Today Sales" value={`₹${stats.todaySales.toLocaleString()}`} icon={IndianRupee} trend={stats.todaySales > 0 ? 'Live data' : 'No sales yet'} trendUp={stats.todaySales > 0} gradient />
        <StatCard title="Monthly Sales" value={`₹${(stats.monthlySales / 1000).toFixed(1)}K`} icon={TrendingUp} trend="This month" />
        <StatCard title="Products" value={stats.totalProducts.toString()} icon={Package} />
        <StatCard title="Low Stock" value={stats.lowStock.toString()} icon={AlertTriangle} trend={stats.lowStock > 0 ? 'Needs attention' : 'All good'} />
      </div>

      {revenueData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl glass-card shadow-soft p-4">
          <h2 className="text-sm font-semibold mb-4 text-foreground">Revenue This Week</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(20, 14%, 90%)" strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 50%)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'hsl(15, 25%, 10%)', border: 'none', borderRadius: '12px', color: 'hsl(20, 20%, 95%)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(24, 95%, 53%)" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
        {[
          { icon: Package, label: 'Workspace', desc: 'Manage products', path: '/workspace' },
          { icon: IndianRupee, label: 'New Bill', desc: 'Create invoice', path: '/billing' },
          { icon: Receipt, label: 'History', desc: 'Past invoices', path: '/history' },
          { icon: Users, label: 'Customers', desc: 'Customer data', path: '/customers' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => navigate(item.path)} className="p-4 rounded-2xl glass-card shadow-soft text-left hover:shadow-elevated transition-shadow">
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
