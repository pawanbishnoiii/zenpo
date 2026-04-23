// UPI QR dialog — renders a UPI intent QR for the owner's UPI ID, records a 'upi_qr' txn.
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { buildUpiUri } from '@/lib/razorpay';
import { supabase } from '@/integrations/supabase/client';
import { playSound } from '@/lib/sounds';

interface Props {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  amount: number;
  upiId: string;
  payeeName: string;
  invoiceNumber: string;
  businessId: string;
  invoiceId?: string | null;
}

const UpiQrDialog = ({ open, onClose, onPaid, amount, upiId, payeeName, invoiceNumber, businessId, invoiceId }: Props) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);

  const upiUri = upiId ? buildUpiUri({ vpa: upiId, payeeName: payeeName || 'Merchant', amount, note: invoiceNumber }) : '';

  useEffect(() => {
    // record an open UPI QR txn when dialog opens
    if (!open || !businessId || !upiId) return;
    setRecording(true);
    supabase.from('payment_transactions').insert({
      business_id: businessId,
      invoice_id: invoiceId || null,
      amount,
      currency: 'INR',
      status: 'created',
      flow: 'upi_qr',
      method: 'upi',
      commission_percent: 0,
      commission_amount: 0,
      owner_net_amount: amount,
      raw_event: { upi_id: upiId, invoice_number: invoiceNumber },
    }).then(() => setRecording(false));
  }, [open, businessId, upiId, amount, invoiceId, invoiceNumber]);

  const handleCopy = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: 'UPI ID copied' });
  };

  const handleMarkPaid = () => {
    playSound('cash');
    toast({ title: 'Marked as Paid', description: 'Customer will get the receipt.' });
    onPaid();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display"><Smartphone className="w-5 h-5 text-primary" /> Scan UPI QR</DialogTitle>
          <DialogDescription>Customer pays directly to your UPI account</DialogDescription>
        </DialogHeader>

        {!upiId ? (
          <div className="rounded-xl bg-warning/10 border border-warning/30 p-4 flex gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <div>
              <p className="font-semibold text-foreground">UPI ID not set</p>
              <p className="text-muted-foreground mt-1">Add your UPI ID in Settings → Business Profile to enable UPI QR payments.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-4 flex items-center justify-center">
              <QRCodeSVG value={upiUri} size={220} level="M" includeMargin />
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold font-display gradient-primary-text">₹{amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Invoice: {invoiceNumber}</p>
            </div>
            <button onClick={handleCopy}
              className="w-full p-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              {upiId}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              Customer scans with any UPI app (GPay, PhonePe, Paytm, BHIM)
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleMarkPaid} disabled={recording}
                className="flex-[2] py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {recording ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Mark as Paid
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpiQrDialog;
