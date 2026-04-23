// Quick credit (+/-) adjustment dialog. Uses RPC adjust_customer_credit for atomicity.
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Minus, Loader2, IndianRupee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  customer: { id: string; full_name: string; credit_balance: number } | null;
  businessId: string;
  onChanged: (newBalance: number) => void;
}

const CreditAdjustDialog = ({ open, onClose, customer, businessId, onChanged }: Props) => {
  const { toast } = useToast();
  const [direction, setDirection] = useState<'add' | 'reduce'>('reduce');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!customer) return null;

  const handleSave = async () => {
    const a = Number(amount);
    if (!a || a <= 0) { toast({ title: 'Enter amount', variant: 'destructive' }); return; }
    setSaving(true);
    const signed = direction === 'add' ? a : -a;
    const { data, error } = await supabase.rpc('adjust_customer_credit', {
      _business_id: businessId, _customer_id: customer.id, _amount: signed, _reason: reason || (direction === 'add' ? 'Credit added' : 'Credit reduced (paid)'),
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: direction === 'add' ? 'Credit added' : 'Credit reduced', description: `New balance: ₹${Number(data).toFixed(0)}` });
      onChanged(Number(data));
      setAmount(''); setReason(''); onClose();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Adjust Credit — {customer.full_name}</DialogTitle>
          <DialogDescription>Current balance: ₹{Number(customer.credit_balance || 0).toFixed(0)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDirection('add')}
              className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${direction === 'add' ? 'bg-warning/15 text-warning border-2 border-warning/40' : 'bg-secondary text-secondary-foreground border-2 border-transparent'}`}>
              <Plus className="w-4 h-4" /> Add Credit
            </button>
            <button onClick={() => setDirection('reduce')}
              className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${direction === 'reduce' ? 'bg-success/15 text-success border-2 border-success/40' : 'bg-secondary text-secondary-foreground border-2 border-transparent'}`}>
              <Minus className="w-4 h-4" /> Reduce (Paid)
            </button>
          </div>

          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="number" min="0" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-background border border-border text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <input type="text" placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />

          <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
            New balance: <strong className="text-foreground">
              ₹{(Number(customer.credit_balance || 0) + (direction === 'add' ? Number(amount || 0) : -Number(amount || 0))).toFixed(0)}
            </strong>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium">Cancel</button>
            <button onClick={handleSave} disabled={saving || !amount}
              className="flex-[2] py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditAdjustDialog;
