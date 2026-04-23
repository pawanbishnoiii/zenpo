import { motion } from 'framer-motion';
import { IndianRupee, Package, TrendingUp, AlertTriangle, Receipt, Users, Tag, BarChart3, Settings, Globe, ExternalLink, Palette, MessageCircle, Share2, Wallet, FileText, Calculator, ChevronRight, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProfileButton from '@/components/dashboard/ProfileButton';
import { useBusiness } from '@/hooks/useBusiness';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryConfig } from '@/lib/categoryConfig';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  todayGst: number;
  monthGst: number;
  pendingPayments: number; // udhar outstanding
  totalInvoices: number;
  totalProducts: number;
  lowStock: number;
  totalCustomers: number;
  activeOffers: number;
  netProfit: number;
}

const Dashboard = () => {
  const { business } = useBusiness();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0, monthlySales: 0, todayGst: 0, monthGst: 0, pendingPayments: 0,
    totalInvoices: 0, totalProducts: 0, lowStock: 0, totalCustomers: 0, activeOffers: 0, netProfit: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [chartView, setChartView] = useState<'week' | 'month'>('week');

  const categoryConfig = business ? getCategoryConfig(business.category) : null;
  const CategoryIcon = categoryConfig?.icon || Package;
  const gstEnabled = (business as any)?.gst_enabled !== false;

  useEffect(() => {
    if (!business) return;
    const fetchAll = async () => {
      const today = dayjs().startOf('day').toISOString();
      const monthStart = dayjs().startOf('month').toISOString();

      const [todayInv, monthInv, prods, custs, allInv, offers, udhar, recents] = await Promise.all([
        supabase.from('invoices').select('grand_total, tax_total').eq('business_id', business.id).gte('created_at', today),
        supabase.from('invoices').select('grand_total, tax_total').eq('business_id', business.id).gte('created_at', monthStart),
        supabase.from('products').select('id, stock').eq('business_id', business.id),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
        supabase.from('business_offers').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('is_active', true),
        supabase.from('customers').select('credit_balance').eq('business_id', business.id).gt('credit_balance', 0),
        supabase.from('invoices').select('id, invoice_number, customer_name, grand_total, tax_total, payment_method, created_at')
          .eq('business_id', business.id).order('created_at', { ascending: false }).limit(8),
      ]);

      const todaySales = (todayInv.data || []).reduce((s, i) => s + Number(i.grand_total || 0), 0);
      const todayGst = (todayInv.data || []).reduce((s, i) => s + Number(i.tax_total || 0), 0);
      const monthlySales = (monthInv.data || []).reduce((s, i) => s + Number(i.grand_total || 0), 0);
      const monthGst = (monthInv.data || []).reduce((s, i) => s + Number(i.tax_total || 0), 0);
      const pendingPayments = (udhar.data || []).reduce((s, c) => s + Number(c.credit_balance || 0), 0);
      const lowStock = (prods.data || []).filter(p => p.stock < 20).length;
      // Net profit ≈ revenue minus GST collected (simplified)
      const netProfit = monthlySales - monthGst;

      setStats({
        todaySales, monthlySales, todayGst, monthGst, pendingPayments,
        totalInvoices: allInv.count || 0, totalProducts: prods.data?.length || 0,
        lowStock, totalCustomers: custs.count || 0, activeOffers: offers.count || 0, netProfit,
      });
      setRecentInvoices(recents.data || []);
    };
    fetchAll();
  }, [business?.id]);

  // Chart data based on view
  useEffect(() => {
    if (!business) return;
    const loadChart = async () => {
      const days = chartView === 'week' ? 7 : 30;
      const arr = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = dayjs().subtract(i, 'day');
        const { data } = await supabase.from('invoices').select('grand_total, tax_total')
          .eq('business_id', business.id)
          .gte('created_at', d.startOf('day').toISOString())
          .lte('created_at', d.endOf('day').toISOString());
        arr.push({
          name: chartView === 'week' ? d.format('ddd') : d.format('D'),
          revenue: (data || []).reduce((s, x) => s + Number(x.grand_total || 0), 0),
          gst: (data || []).reduce((s, x) => s + Number(x.tax_total || 0), 0),
        });
      }
      setRevenueData(arr);
    };
    loadChart();
  }, [business?.id, chartView]);

  const storeUrl = business?.store_slug ? `${window.location.origin}/store/${business.store_slug}` : '';

  // 6 KPI cards (color coded)
  const kpiCards = [
    { title: "Today's Sales", value: `₹${stats.todaySales.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'success', sub: 'Live' },
    { title: 'Monthly Sales', value: `₹${stats.monthlySales.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'success', sub: dayjs().format('MMMM') },
    { title: 'GST Collected', value: `₹${stats.monthGst.toLocaleString('en-IN')}`, icon: Receipt, color: 'primary', sub: gstEnabled ? 'This month' : 'GST off' },
    { title: 'Pending Payments', value: `₹${stats.pendingPayments.toLocaleString('en-IN')}`, icon: Wallet, color: stats.pendingPayments > 0 ? 'warning' : 'muted', sub: 'Udhar outstanding' },
    { title: 'Total Invoices', value: stats.totalInvoices.toLocaleString('en-IN'), icon: FileText, color: 'primary', sub: 'All-time' },
    { title: 'Net Profit', value: `₹${stats.netProfit.toLocaleString('en-IN')}`, icon: Calculator, color: stats.netProfit >= 0 ? 'success' : 'destructive', sub: 'Revenue − GST' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
    destructive: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
    muted: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  };

  const quickActions = [
    { icon: IndianRupee, label: 'New Invoice', desc: 'Create bill', path: '/billing', color: 'primary' },
    { icon: Users, label: 'Add Customer', desc: 'CRM', path: '/customers', color: 'success' },
    { icon: Package, label: 'Add Product', desc: 'Workspace', path: '/workspace', color: 'accent' },
    { icon: BarChart3, label: 'View Reports', desc: 'Analytics', path: '/reports', color: 'warning' },
  ];

  const handleWhatsAppShare = () => {
    if (!storeUrl) return;
    const text = `Check out ${business?.business_name}: ${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="px-4 pt-4 lg:pl-24 max-w-6xl mx-auto space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground font-medium">{dayjs().format('dddd, D MMMM YYYY')}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold font-display text-foreground">{business?.business_name || 'Dashboard'}</motion.h1>
        </div>
        <div className="flex items-center gap-2">
          <ProfileButton />
        </div>
      </div>

      {/* Category badge + store URL */}
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

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const colors = colorMap[card.color];
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`rounded-2xl glass-card shadow-soft p-4 border ${colors.border} relative overflow-hidden group hover:shadow-elevated transition-shadow`}>
              <div className="flex items-start justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </div>
              <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{card.title}</p>
              <p className="text-xl font-bold font-display text-foreground tracking-tight">{card.value}</p>
              <p className={`text-[10px] mt-1 ${colors.text} font-medium`}>{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Sales Chart + GST Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-2xl glass-card shadow-soft p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Sales Trend</h2>
              <p className="text-[11px] text-muted-foreground">Revenue & GST over time</p>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(['week', 'month'] as const).map(v => (
                <button key={v} onClick={() => setChartView(v)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize ${chartView === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                  {v === 'week' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
          {revenueData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gstGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="gst" name="GST" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#gstGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-xs">
              <Clock className="w-8 h-8 opacity-30 mr-2" /> No data yet — start billing to see trends
            </div>
          )}
        </motion.div>

        {/* GST Summary Box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl glass-card shadow-soft overflow-hidden">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center"><Calculator className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="text-sm font-bold text-foreground">GST Summary</p>
              <p className="text-[10px] text-muted-foreground">{dayjs().format('MMMM YYYY')}</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'CGST (9%)', value: stats.monthGst / 2 },
              { label: 'SGST (9%)', value: stats.monthGst / 2 },
              { label: 'IGST (18%)', value: 0 },
            ].map(g => (
              <div key={g.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{g.label}</span>
                <span className="font-bold text-foreground">₹{g.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Total GST</span>
              <span className="text-base font-bold gradient-primary-text">₹{stats.monthGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <button onClick={() => navigate('/reports')} className="w-full mt-2 py-2 rounded-lg bg-primary/5 text-primary text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-primary/10">
              View detailed report <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Recent Invoices Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl glass-card shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Recent Invoices</h2>
            <p className="text-[11px] text-muted-foreground">Last 8 transactions</p>
          </div>
          <button onClick={() => navigate('/history')} className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Receipt className="w-8 h-8 mx-auto opacity-30 mb-2" /> No invoices yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left p-3 font-semibold">Invoice #</th>
                  <th className="text-left p-3 font-semibold">Customer</th>
                  <th className="text-right p-3 font-semibold">Amount</th>
                  <th className="text-right p-3 font-semibold hidden sm:table-cell">GST</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                  <th className="text-right p-3 font-semibold hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(inv => {
                  const isPaid = inv.payment_method !== 'credit';
                  return (
                    <tr key={inv.id} onClick={() => navigate('/history')}
                      className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors">
                      <td className="p-3 font-mono text-foreground">{inv.invoice_number}</td>
                      <td className="p-3 text-foreground truncate max-w-[120px]">{inv.customer_name || '—'}</td>
                      <td className="p-3 text-right font-bold text-foreground">₹{Number(inv.grand_total).toFixed(0)}</td>
                      <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">₹{Number(inv.tax_total).toFixed(0)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {isPaid ? 'PAID' : 'UDHAR'}
                        </span>
                      </td>
                      <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{dayjs(inv.created_at).format('D MMM, h:mm A')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Actions Panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(item => {
            const Icon = item.icon;
            const colors = colorMap[item.color] || colorMap.primary;
            return (
              <button key={item.label} onClick={() => navigate(item.path)}
                className="p-4 rounded-2xl glass-card shadow-soft text-left hover:shadow-elevated transition-shadow group">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* WhatsApp share */}
      {storeUrl && (
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleWhatsAppShare}
            className="flex-1 py-2.5 rounded-xl bg-success/10 text-success text-xs font-semibold flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { navigator.clipboard.writeText(storeUrl); toast({ title: 'Link copied!' }); }}
            className="py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Copy Link
          </motion.button>
        </div>
      )}

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: categoryConfig?.navLabel.workspace || 'Products', value: stats.totalProducts, icon: Package, color: 'primary' },
          { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'success' },
          { label: 'Active Offers', value: stats.activeOffers, icon: Tag, color: 'warning' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? 'destructive' : 'muted' },
        ].map(s => {
          const Icon = s.icon;
          const c = colorMap[s.color] || colorMap.muted;
          return (
            <div key={s.label} className="rounded-2xl glass-card shadow-soft p-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${c.text}`} /></div>
              <div>
                <p className="text-lg font-bold font-display text-foreground leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
