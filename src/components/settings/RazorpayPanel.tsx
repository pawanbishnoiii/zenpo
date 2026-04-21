import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Eye, EyeOff, Copy, Check, Loader2, Save, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';

const RazorpayPanel = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('Invoice payment');
  const [enabled, setEnabled] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!business) return;
    setLoading(true);
    supabase.from('payment_settings').select('*').eq('business_id', business.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setKeyId(data.razorpay_key_id || '');
          setKeySecret(data.razorpay_key_secret || '');
          setDisplayName(data.business_display_name || business.business_name || '');
          setDescription(data.payment_description || 'Invoice payment');
          setEnabled(data.is_enabled);
          setTestMode(data.is_test_mode);
        } else {
          setDisplayName(business.business_name || '');
        }
        setLoading(false);
      });
  }, [business?.id]);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    const payload = {
      business_id: business.id,
      razorpay_key_id: keyId.trim(),
      razorpay_key_secret: keySecret.trim(),
      business_display_name: displayName.trim() || business.business_name,
      payment_description: description.trim() || 'Invoice payment',
      is_enabled: enabled,
      is_test_mode: testMode,
    };
    const { error } = await supabase.from('payment_settings').upsert(payload, { onConflict: 'business_id' });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Saved!', description: 'Razorpay settings updated.' });
    setSaving(false);
  };

  const handleTest = async () => {
    if (!business) return;
    setTesting(true);
    setTestStatus('idle');
    try {
      // Save first so the function reads latest values
      await handleSave();
      const { data, error } = await supabase.functions.invoke('razorpay-test', {
        body: { action: 'test', business_id: business.id },
      });
      if (error) throw error;
      if (data?.ok) { setTestStatus('ok'); toast({ title: 'Connected ✓', description: `Mode: ${data.mode}` }); }
      else { setTestStatus('fail'); toast({ title: 'Failed', description: data?.error || 'Invalid keys', variant: 'destructive' }); }
    } catch (e: any) {
      setTestStatus('fail');
      toast({ title: 'Test failed', description: e.message, variant: 'destructive' });
    } finally { setTesting(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
        <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Ezo POS uses Razorpay for online payments</p>
          <p className="text-xs text-muted-foreground mt-1">Get your API keys from <a className="text-primary underline" target="_blank" rel="noopener" href="https://dashboard.razorpay.com/app/keys">razorpay.com/dashboard → Settings → API Keys</a>.</p>
        </div>
      </div>

      {testMode && (
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 flex gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <span><strong>Test Mode:</strong> Use keys starting with <code className="px-1 bg-muted rounded">rzp_test_</code>. No real money will be charged.</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Razorpay Key ID</label>
          <div className="relative">
            <input value={keyId} onChange={e => setKeyId(e.target.value)} placeholder="rzp_test_XXXXX"
              className="w-full px-3 py-2.5 pr-10 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={() => { navigator.clipboard.writeText(keyId); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Razorpay Key Secret</label>
          <div className="relative">
            <input type={showSecret ? 'text' : 'password'} value={keySecret} onChange={e => setKeySecret(e.target.value)} placeholder="••••••••••••••••"
              className="w-full px-3 py-2.5 pr-10 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted">
              {showSecret ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Business Display Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Shown on Razorpay payment page"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Default Payment Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 rounded-xl bg-card border border-border cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-foreground">Enable Razorpay Payments</p>
            <p className="text-xs text-muted-foreground">Show Razorpay as a payment option in billing</p>
          </div>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}
            className="w-10 h-5 appearance-none bg-muted rounded-full relative checked:bg-primary transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-[22px] before:transition-all" />
        </label>
        <label className="flex items-center justify-between p-3 rounded-xl bg-card border border-border cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-foreground">Test Mode</p>
            <p className="text-xs text-muted-foreground">Use sandbox keys for testing — no real money charged</p>
          </div>
          <input type="checkbox" checked={testMode} onChange={e => setTestMode(e.target.checked)}
            className="w-10 h-5 appearance-none bg-muted rounded-full relative checked:bg-primary transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-[22px] before:transition-all" />
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleTest} disabled={testing || !keyId || !keySecret}
          className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Test Connection
          {testStatus === 'ok' && <span className="text-xs text-success ml-1">✓ Connected</span>}
          {testStatus === 'fail' && <span className="text-xs text-destructive ml-1">✗ Invalid</span>}
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="ml-auto px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </motion.button>
      </div>
    </div>
  );
};

export default RazorpayPanel;
