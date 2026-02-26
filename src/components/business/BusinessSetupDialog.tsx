import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Wrench, Loader2 } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';

const BusinessSetupDialog = () => {
  const { createBusiness } = useBusiness();
  const { toast } = useToast();
  const [step, setStep] = useState<'type' | 'name'>('type');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await createBusiness(name, category) || {};
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Business created!', description: 'You can now start adding products.' });
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass-card shadow-elevated p-6 space-y-4 border-2 border-primary/20"
    >
      <h2 className="text-lg font-bold font-display text-foreground">Setup Your Business</h2>
      <p className="text-sm text-muted-foreground">Choose your business type to get started</p>

      {step === 'type' ? (
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setCategory('car_wash'); setStep('name'); }}
            className="p-4 rounded-2xl border-2 border-primary/20 hover:border-primary bg-primary/5 text-left space-y-2 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">Car Wash Center</p>
            <p className="text-xs text-muted-foreground">Washing, detailing, foam wash services</p>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setCategory('spare_parts'); setStep('name'); }}
            className="p-4 rounded-2xl border-2 border-accent/20 hover:border-accent bg-accent/5 text-left space-y-2 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm font-bold text-foreground">Spare Parts & Mods</p>
            <p className="text-xs text-muted-foreground">Parts, labour, vehicle modification</p>
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Business Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            <button onClick={() => setStep('type')} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">
              Back
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={loading || !name.trim()}
              onClick={handleCreate}
              className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Business
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessSetupDialog;
