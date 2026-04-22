import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';
import dayjs from 'dayjs';

interface Staff {
  id: string;
  full_name: string;
  pin: string;
  role: string;
  last_active_at: string | null;
}

const StaffPanel = () => {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'staff' | 'owner'>('staff');
  const [adding, setAdding] = useState(false);
  const [showPins, setShowPins] = useState(false);

  const load = async () => {
    if (!business) return;
    setLoading(true);
    const { data } = await supabase.from('staff').select('*').eq('business_id', business.id).order('created_at', { ascending: false });
    setStaff((data as Staff[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [business?.id]);

  const handleAdd = async () => {
    if (!business || !name.trim() || !/^\d{4}$/.test(pin)) {
      toast({ title: 'Invalid input', description: 'Name and 4-digit PIN required.', variant: 'destructive' });
      return;
    }
    setAdding(true);
    const { error } = await supabase.from('staff').insert({ business_id: business.id, full_name: name.trim(), pin, role });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Staff added!' }); setName(''); setPin(''); setRole('staff'); load(); }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('staff').delete().eq('id', id);
    toast({ title: 'Removed' });
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
        <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Staff & PIN Access</p>
          <p className="text-xs text-muted-foreground mt-1">Add staff with 4-digit PINs. Owners see all sales; staff see only their own.</p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add new staff member</p>
        <div className="grid md:grid-cols-3 gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
            className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4-digit PIN" inputMode="numeric"
            className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={role} onChange={e => setRole(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={adding}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Staff
        </motion.button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team ({staff.length})</p>
          <button onClick={() => setShowPins(s => !s)} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
            {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPins ? 'Hide PINs' : 'Show PINs'}
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : staff.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">No staff added yet.</div>
        ) : (
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            {staff.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-card">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.role === 'owner' ? 'bg-warning/15 text-warning' : 'bg-primary/10 text-primary'}`}>
                  {s.role === 'owner' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{s.full_name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{s.role} • Last active: {s.last_active_at ? dayjs(s.last_active_at).fromNow() : 'never'}</p>
                </div>
                <span className="font-mono text-sm text-foreground tabular-nums">{showPins ? s.pin : '••••'}</span>
                <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/15">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPanel;
