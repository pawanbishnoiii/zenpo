import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Wrench, Store, MapPin, Phone, FileText, Loader2, ChevronRight, ChevronLeft, Check, Printer } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const steps = ['Business Type', 'Business Name', 'Contact Info', 'Tax & Legal', 'Confirm'];

const Onboarding = () => {
  const { business, loading, createBusiness } = useBusiness();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('car_wash');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');
  const [printerType, setPrinterType] = useState('58mm');
  const [saving, setSaving] = useState(false);

  if (!loading && business) return <Navigate to="/dashboard" replace />;

  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return name.trim().length >= 2;
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from('businesses').insert({
        owner_id: user.id,
        business_name: name.trim(),
        category,
        theme: category,
        phone: phone.trim() || null,
        address: address.trim() || null,
        gst_number: gst.trim() || null,
        printer_type: printerType,
        store_slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }).select().single();

      if (error) throw error;
      if (data) {
        await supabase.rpc('seed_business_starter_catalog', { _business_id: data.id });
      }
      toast({ title: '🎉 Business Created!', description: 'Your workspace is ready with starter products.' });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-6 lg:pl-24 max-w-lg mx-auto space-y-6 pb-24">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-display text-foreground">Setup Your Business</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length} — {steps[step]}</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? 'gradient-primary' : 'bg-secondary'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCategory('car_wash')}
                className={`p-5 rounded-2xl border-2 text-left space-y-3 transition-colors ${category === 'car_wash' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">Car Wash</p>
                <p className="text-xs text-muted-foreground">Services, detailing, accessories</p>
                {category === 'car_wash' && <Check className="w-5 h-5 text-primary" />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCategory('spare_parts')}
                className={`p-5 rounded-2xl border-2 text-left space-y-3 transition-colors ${category === 'spare_parts' ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-bold text-foreground">Spare Parts</p>
                <p className="text-xs text-muted-foreground">Parts, labour, modification</p>
                {category === 'spare_parts' && <Check className="w-5 h-5 text-accent" />}
              </motion.button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Business Name *" value={name} onChange={(e) => setName(e.target.value)} autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground">Ye naam aapke invoices aur store link me dikhega</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea placeholder="Business Address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="GST Number (optional)" value={gst} onChange={(e) => setGst(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><Printer className="w-3 h-3" /> Printer Paper Size</p>
                <div className="flex gap-2">
                  {['58mm', '80mm'].map(s => (
                    <button key={s} onClick={() => setPrinterType(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${printerType === s ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="rounded-2xl glass-card shadow-soft p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground">Review Your Setup</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-semibold text-foreground">{category === 'car_wash' ? 'Car Wash' : 'Spare Parts'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-semibold text-foreground">{name}</span></div>
                {phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground">{phone}</span></div>}
                {address && <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-foreground truncate max-w-[180px]">{address}</span></div>}
                {gst && <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span className="text-foreground">{gst}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Printer</span><span className="text-foreground">{printerType}</span></div>
              </div>
              <p className="text-xs text-muted-foreground">Starter catalog automatically add hoga aapke business type ke hisab se.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 4 ? (
          <motion.button whileTap={{ scale: 0.97 }} disabled={!canNext()} onClick={() => setStep(s => s + 1)}
            className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-1 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.97 }} disabled={saving} onClick={handleFinish}
            className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Create Business
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
