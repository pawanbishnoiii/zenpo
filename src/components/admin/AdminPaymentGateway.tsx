// Admin: Razorpay configuration with single-mode toggle (test XOR live).
// Both keys saved separately, only ACTIVE mode is used by edge functions.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Save, Loader2, AlertTriangle, Key, Webhook, Percent, Copy, Check, Globe, Zap, ToggleLeft, ToggleRight, FlaskConical, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/razorpay-webhook`;

type Tab = 'api' | 'webhook' | 'commission';
type Mode = 'test' | 'live';

const AdminPaymentGateway = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('api');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [copied, setCopied] = useState(false);

  // Separate keys for test & live; only active mode is used live
  const [testKeyId, setTestKeyId] = useState('');
  const [testKeySecret, setTestKeySecret] = useState('');
  const [liveKeyId, setLiveKeyId] = useState('');
  const [liveKeySecret, setLiveKeySecret] = useState('');
  const [activeMode, setActiveMode] = useState<Mode>('test');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [commission, setCommission] = useState('2.0');
  const [enabled, setEnabled] = useState(false);
  const [payoutWindow, setPayoutWindow] = useState('04:00-06:00');
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('admin_payment_settings').select('*').eq('singleton', true).maybeSingle();
      const d: any = data;
      if (d) {
        setRecordId(d.id);
        setTestKeyId(d.test_key_id || '');
        setTestKeySecret(d.test_key_secret || '');
        setLiveKeyId(d.live_key_id || '');
        setLiveKeySecret(d.live_key_secret || '');
        setActiveMode((d.active_mode as Mode) || (d.is_test_mode ? 'test' : 'live'));
        setWebhookSecret(d.razorpay_webhook_secret || '');
        setCommission(String(d.default_commission_percent ?? 2.0));
        setEnabled(d.is_enabled);
        setPayoutWindow(d.payout_time_window || '04:00-06:00');
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    // Validation: active mode keys must be present if enabled
    if (enabled) {
      if (activeMode === 'test' && (!testKeyId.trim() || !testKeySecret.trim())) {
        toast({ title: 'Test keys required', description: 'Active mode is TEST. Fill rzp_test_ keys first.', variant: 'destructive' });
        return;
      }
      if (activeMode === 'live' && (!liveKeyId.trim() || !liveKeySecret.trim())) {
        toast({ title: 'Live keys required', description: 'Active mode is LIVE. Fill rzp_live_ keys first.', variant: 'destructive' });
        return;
      }
    }

    setSaving(true);
    const activeKeyId = activeMode === 'live' ? liveKeyId.trim() : testKeyId.trim();
    const activeKeySecret = activeMode === 'live' ? liveKeySecret.trim() : testKeySecret.trim();

    const payload: any = {
      singleton: true,
      test_key_id: testKeyId.trim(),
      test_key_secret: testKeySecret.trim(),
      live_key_id: liveKeyId.trim(),
      live_key_secret: liveKeySecret.trim(),
      active_mode: activeMode,
      // Mirror active key set to legacy columns for back-compat with existing edge functions
      razorpay_key_id: activeKeyId,
      razorpay_key_secret: activeKeySecret,
      is_test_mode: activeMode === 'test',
      razorpay_webhook_secret: webhookSecret.trim(),
      default_commission_percent: parseFloat(commission) || 0,
      is_enabled: enabled,
      payout_time_window: payoutWindow,
    };

    let error: any;
    if (recordId) {
      ({ error } = await supabase.from('admin_payment_settings').update(payload).eq('id', recordId));
    } else {
      const res = await supabase.from('admin_payment_settings').insert(payload).select().single();
      error = res.error;
      if (res.data) setRecordId(res.data.id);
    }

    if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    else toast({ title: `Saved! Active: ${activeMode.toUpperCase()}`, description: 'Razorpay configuration updated.' });
    setSaving(false);
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: 'Webhook URL copied' });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'webhook', label: 'Webhook', icon: Webhook },
    { id: 'commission', label: 'Commission', icon: Percent },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Razorpay Payment Gateway</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Single-mode toggle: Test OR Live runs at a time. Both keys are saved.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
            {enabled ? '● ENABLED' : '○ DISABLED'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeMode === 'live' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
            {activeMode === 'live' ? <><Rocket className="w-3 h-3 inline mr-1" /> LIVE</> : <><FlaskConical className="w-3 h-3 inline mr-1" /> TEST</>}
          </span>
        </div>
      </div>

      {/* Mode switch (single source of truth) */}
      <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Active Mode:</span>
        {(['test', 'live'] as Mode[]).map(m => (
          <button key={m} onClick={() => setActiveMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeMode === m ? (m === 'live' ? 'gradient-primary text-primary-foreground glow-primary' : 'bg-warning/15 text-warning border border-warning/30') : 'bg-secondary text-secondary-foreground'}`}>
            {m === 'live' ? <Rocket className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
            {m === 'live' ? 'LIVE (real money)' : 'TEST (no money)'}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${tab === t.id ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Master toggle */}
      <button onClick={() => setEnabled(!enabled)} className="w-full rounded-xl glass-card p-3 flex items-center justify-between text-left">
        <div>
          <p className="text-sm font-semibold text-foreground">Gateway Enabled</p>
          <p className="text-[11px] text-muted-foreground">Allow stores to accept online payments globally</p>
        </div>
        {enabled ? <ToggleRight className="w-8 h-8 text-success" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
      </button>

      {/* API Keys Tab */}
      {tab === 'api' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs">
            <p className="font-semibold text-foreground mb-1">How to get your keys:</p>
            <ol className="text-muted-foreground space-y-0.5 list-decimal pl-4">
              <li>Login to <a className="text-primary underline" target="_blank" rel="noopener" href="https://dashboard.razorpay.com/app/keys">Razorpay Dashboard → Settings → API Keys</a></li>
              <li>Generate <strong>both</strong> Test (rzp_test_) and Live (rzp_live_) keys</li>
              <li>Paste below — only the <strong>Active Mode</strong> keys are used at any time</li>
            </ol>
          </div>

          {/* TEST keys */}
          <div className={`rounded-2xl border p-4 space-y-3 ${activeMode === 'test' ? 'border-warning/40 bg-warning/5' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-warning" /> Test Keys (no real money)
              </h3>
              {activeMode === 'test' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning">ACTIVE</span>}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={testKeyId} onChange={e => setTestKeyId(e.target.value)} placeholder="rzp_test_XXXXXXXX"
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="relative">
                <input type={showSecret ? 'text' : 'password'} value={testKeySecret} onChange={e => setTestKeySecret(e.target.value)}
                  placeholder="Test key secret"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted">
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* LIVE keys */}
          <div className={`rounded-2xl border p-4 space-y-3 ${activeMode === 'live' ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary" /> Live Keys (production)
              </h3>
              {activeMode === 'live' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">ACTIVE</span>}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={liveKeyId} onChange={e => setLiveKeyId(e.target.value)} placeholder="rzp_live_XXXXXXXX"
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type={showSecret ? 'text' : 'password'} value={liveKeySecret} onChange={e => setLiveKeySecret(e.target.value)}
                placeholder="Live key secret"
                className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {activeMode === 'live' && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 flex gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <span><strong>Live mode active!</strong> Real money will be charged. Make sure webhook is also configured.</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Webhook Tab */}
      {tab === 'webhook' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs">
            <p className="font-semibold text-foreground mb-2">Webhook setup:</p>
            <ol className="text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Go to Razorpay Dashboard → Settings → <strong>Webhooks</strong></li>
              <li>Click <strong>Add New Webhook</strong> and paste the URL below</li>
              <li>Select events: <code className="px-1 bg-muted rounded">payment.captured</code>, <code className="px-1 bg-muted rounded">payment.failed</code>, <code className="px-1 bg-muted rounded">payment_link.paid</code></li>
              <li>Set webhook secret (any random string), save in both Razorpay and below</li>
            </ol>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" /> Webhook URL (paste in Razorpay)</label>
            <div className="relative">
              <input readOnly value={WEBHOOK_URL}
                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-muted border border-border text-xs font-mono text-foreground" />
              <button onClick={copyWebhook} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-card">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Webhook Secret</label>
            <div className="relative">
              <input type={showWebhook ? 'text' : 'password'} value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)}
                placeholder="Same secret you set in Razorpay webhook config"
                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={() => setShowWebhook(!showWebhook)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted">
                {showWebhook ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">Used to verify incoming events from Razorpay (HMAC-SHA256).</p>
          </div>

          <div className="rounded-xl bg-success/5 border border-success/20 p-3 text-xs">
            <p className="font-semibold text-foreground">✓ Webhook & API are independent</p>
            <p className="text-muted-foreground mt-1">API keys = create orders/links. Webhook = receive payment confirmations. Configure both for reliable settlement tracking.</p>
          </div>
        </motion.div>
      )}

      {/* Commission Tab */}
      {tab === 'commission' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Default Commission (%)</label>
            <div className="relative max-w-xs">
              <input type="number" step="0.1" min="0" max="20" value={commission} onChange={e => setCommission(e.target.value)}
                className="w-full px-3 py-2.5 pr-8 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Owner receives <strong>{(100 - parseFloat(commission || '0')).toFixed(1)}%</strong> of each payment.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Daily Settlement Window (IST)</label>
            <input value={payoutWindow} onChange={e => setPayoutWindow(e.target.value)} placeholder="04:00-06:00"
              className="w-full max-w-xs px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <p className="text-[11px] text-muted-foreground mt-1.5">Cron auto-aggregates daily at 04:30 IST.</p>
          </div>

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs space-y-2">
            <p className="font-semibold text-foreground">Example:</p>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="text-center p-2 bg-card rounded-lg"><p className="text-[10px] text-muted-foreground">Customer pays</p><p className="font-bold text-foreground mt-0.5">₹1,000</p></div>
              <div className="text-center p-2 bg-card rounded-lg"><p className="text-[10px] text-muted-foreground">Commission ({commission}%)</p><p className="font-bold text-warning mt-0.5">₹{(1000 * parseFloat(commission || '0') / 100).toFixed(2)}</p></div>
              <div className="text-center p-2 bg-card rounded-lg"><p className="text-[10px] text-muted-foreground">Owner gets</p><p className="font-bold text-success mt-0.5">₹{(1000 - 1000 * parseFloat(commission || '0') / 100).toFixed(2)}</p></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-2 sticky bottom-0 pb-1">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2 disabled:opacity-50 glow-primary shadow-elevated">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Configuration
        </motion.button>
      </div>
    </div>
  );
};

export default AdminPaymentGateway;
