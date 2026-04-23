// Admin: Razorpay configuration (API keys, webhook, commission, test mode)
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Save, Loader2, Zap, AlertTriangle, Key, Webhook, Percent, Copy, Check, Globe, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/razorpay-webhook`;

type Tab = 'api' | 'webhook' | 'commission';

const AdminPaymentGateway = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('api');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [copied, setCopied] = useState(false);

  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [commission, setCommission] = useState('2.0');
  const [enabled, setEnabled] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [payoutWindow, setPayoutWindow] = useState('04:00-06:00');

  useEffect(() => {
    supabase.from('admin_payment_settings').select('*').eq('singleton', true).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setKeyId(data.razorpay_key_id || '');
          setKeySecret(data.razorpay_key_secret || '');
          setWebhookSecret(data.razorpay_webhook_secret || '');
          setCommission(String(data.default_commission_percent ?? 2.0));
          setEnabled(data.is_enabled);
          setTestMode(data.is_test_mode);
          setPayoutWindow(data.payout_time_window || '04:00-06:00');
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      singleton: true,
      razorpay_key_id: keyId.trim(),
      razorpay_key_secret: keySecret.trim(),
      razorpay_webhook_secret: webhookSecret.trim(),
      default_commission_percent: parseFloat(commission) || 0,
      is_enabled: enabled,
      is_test_mode: testMode,
      payout_time_window: payoutWindow,
    };
    const { error } = await supabase.from('admin_payment_settings').upsert(payload, { onConflict: 'singleton' });
    if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Settings saved!', description: 'Razorpay configuration updated.' });
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
          <p className="text-xs text-muted-foreground mt-0.5">Global keys used for ALL stores. Commission auto-deducted on each transaction.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
            {enabled ? '● LIVE' : '○ DISABLED'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${testMode ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
            {testMode ? 'TEST' : 'PRODUCTION'}
          </span>
        </div>
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

      {/* Master toggles */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setEnabled(!enabled)} className="rounded-xl glass-card p-3 flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">Gateway Enabled</p>
            <p className="text-[11px] text-muted-foreground">Allow stores to accept online payments</p>
          </div>
          {enabled ? <ToggleRight className="w-8 h-8 text-success" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
        </button>
        <button onClick={() => setTestMode(!testMode)} className="rounded-xl glass-card p-3 flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">Test Mode</p>
            <p className="text-[11px] text-muted-foreground">Use rzp_test_ keys, no real money</p>
          </div>
          {testMode ? <ToggleRight className="w-8 h-8 text-warning" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
        </button>
      </div>

      {/* API Keys Tab */}
      {tab === 'api' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs">
            <p className="font-semibold text-foreground mb-1">How to get your keys:</p>
            <ol className="text-muted-foreground space-y-0.5 list-decimal pl-4">
              <li>Login to <a className="text-primary underline" target="_blank" rel="noopener" href="https://dashboard.razorpay.com/app/keys">Razorpay Dashboard → Settings → API Keys</a></li>
              <li>Generate new keys (test or live as per mode above)</li>
              <li>Paste Key ID and Secret here, then click Save</li>
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Razorpay Key ID</label>
              <input value={keyId} onChange={e => setKeyId(e.target.value)} placeholder="rzp_test_XXXXX or rzp_live_XXXXX"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Razorpay Key Secret</label>
              <div className="relative">
                <input type={showSecret ? 'text' : 'password'} value={keySecret} onChange={e => setKeySecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted">
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {testMode && (
            <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 flex gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <span><strong>Test Mode active.</strong> Use keys starting with <code className="px-1 bg-muted rounded">rzp_test_</code>. No real money will be charged. Switch off Test Mode for live payments.</span>
            </div>
          )}
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
              <li>Set a webhook secret (any random string), save it both in Razorpay and below</li>
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
            <p className="text-muted-foreground mt-1">API keys = create orders/links. Webhook = receive payment confirmations. You should configure both for reliable settlement tracking.</p>
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
              Applied to every successful transaction. Owner receives <strong>{(100 - parseFloat(commission || '0')).toFixed(1)}%</strong> of each payment.
              You can override per-business in the Stores tab.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Daily Settlement Window (IST)</label>
            <input value={payoutWindow} onChange={e => setPayoutWindow(e.target.value)} placeholder="04:00-06:00"
              className="w-full max-w-xs px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Cron runs daily at this window to aggregate payments into settlement records. Already scheduled at 04:30 IST.
            </p>
          </div>

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs space-y-2">
            <p className="font-semibold text-foreground">Example calculation:</p>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="text-center p-2 bg-card rounded-lg">
                <p className="text-[10px] text-muted-foreground">Customer pays</p>
                <p className="font-bold text-foreground mt-0.5">₹1,000</p>
              </div>
              <div className="text-center p-2 bg-card rounded-lg">
                <p className="text-[10px] text-muted-foreground">Admin commission ({commission}%)</p>
                <p className="font-bold text-warning mt-0.5">₹{(1000 * parseFloat(commission || '0') / 100).toFixed(2)}</p>
              </div>
              <div className="text-center p-2 bg-card rounded-lg">
                <p className="text-[10px] text-muted-foreground">Owner receives</p>
                <p className="font-bold text-success mt-0.5">₹{(1000 - 1000 * parseFloat(commission || '0') / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save button (sticky) */}
      <div className="flex justify-end pt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2 disabled:opacity-50 glow-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Configuration
        </motion.button>
      </div>
    </div>
  );
};

export default AdminPaymentGateway;
