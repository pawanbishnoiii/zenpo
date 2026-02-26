import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { revenueData } from '@/data/mockData';
import PageHeader from '@/components/layout/PageHeader';

const Reports = () => {
  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Reports"
        actions={
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold">
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass-card shadow-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground font-medium">Total Revenue</span>
          </div>
          <p className="text-xl font-bold font-display text-foreground">₹3,45,600</p>
          <p className="text-xs text-success font-medium mt-1">+12.5% this month</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl glass-card shadow-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Invoices</span>
          </div>
          <p className="text-xl font-bold font-display text-foreground">234</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </motion.div>
      </div>

      {/* Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl glass-card shadow-soft p-4">
        <h2 className="text-sm font-semibold mb-4 text-foreground">Daily Revenue</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 50%)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'hsl(222, 25%, 12%)', border: 'none', borderRadius: '12px', color: 'hsl(210, 20%, 95%)', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
