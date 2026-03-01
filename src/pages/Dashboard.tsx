import { motion } from 'framer-motion';
import { IndianRupee, Package, TrendingUp, AlertTriangle, Car, Wrench, LogOut, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import { dashboardStats, revenueData } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import BusinessSetupDialog from '@/components/business/BusinessSetupDialog';

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { business, loading: bizLoading } = useBusiness();
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground font-medium"
          >
            {dayjs().format('dddd, D MMMM YYYY')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold font-display text-foreground"
          >
            {business ? business.business_name : 'Dashboard'}
          </motion.h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"
            >
              <Shield className="w-4 h-4 text-destructive" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Business Setup Prompt */}
      {!bizLoading && !business && <BusinessSetupDialog />}

      {/* Business Type Badge */}
      {business && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            business.category === 'car_wash'
              ? 'bg-primary/10 text-primary'
              : 'bg-accent/10 text-accent'
          }`}>
            {business.category === 'car_wash' ? <Car className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
            {business.category === 'car_wash' ? 'Car Wash Center' : 'Spare Parts & Modification'}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Today Sales" value={`₹${dashboardStats.todaySales.toLocaleString()}`} icon={IndianRupee} trend="+12% from yesterday" trendUp gradient />
        <StatCard title="Monthly Sales" value={`₹${(dashboardStats.monthlySales / 1000).toFixed(0)}K`} icon={TrendingUp} trend="+8% vs last month" trendUp />
        <StatCard title="Total Products" value={dashboardStats.totalProducts.toString()} icon={Package} />
        <StatCard title="Low Stock" value={dashboardStats.lowStockItems.toString()} icon={AlertTriangle} trend="Needs attention" />
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl glass-card shadow-soft p-4">
        <h2 className="text-sm font-semibold mb-4 text-foreground">Revenue This Week</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(20, 14%, 90%)" strokeOpacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 50%)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'hsl(15, 25%, 10%)', border: 'none', borderRadius: '12px', color: 'hsl(20, 20%, 95%)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(24, 95%, 53%)" strokeWidth={2.5} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-3 pb-4">
        <button onClick={() => navigate('/products')} className="p-4 rounded-2xl glass-card shadow-soft text-left hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Add Product</p>
          <p className="text-xs text-muted-foreground">Quick product add</p>
        </button>
        <button onClick={() => navigate('/billing')} className="p-4 rounded-2xl glass-card shadow-soft text-left hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
            <IndianRupee className="w-5 h-5 text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">New Bill</p>
          <p className="text-xs text-muted-foreground">Create invoice</p>
        </button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
