// Razorpay Checkout SDK loader + invoke helper.
// Loads the script once, returns a typed open() helper.

declare global {
  interface Window {
    Razorpay?: any;
  }
}

let scriptPromise: Promise<boolean> | null = null;

export const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => { scriptPromise = null; resolve(false); };
    document.head.appendChild(s);
  });
  return scriptPromise;
};

export interface RzpOpenParams {
  key: string;
  amount: number; // paise
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  onSuccess: (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
  onFailure?: (err: any) => void;
}

export const openRazorpayCheckout = async (params: RzpOpenParams): Promise<void> => {
  const ok = await loadRazorpayScript();
  if (!ok || !window.Razorpay) throw new Error('Razorpay SDK failed to load. Check internet connection.');
  const rzp = new window.Razorpay({
    key: params.key,
    amount: params.amount,
    currency: params.currency,
    order_id: params.order_id,
    name: params.name,
    description: params.description || 'Invoice payment',
    prefill: params.prefill,
    theme: params.theme || { color: '#6366f1' },
    handler: params.onSuccess,
    modal: { ondismiss: params.onDismiss },
  });
  rzp.on('payment.failed', (resp: any) => params.onFailure?.(resp.error));
  rzp.open();
};

// Build a UPI intent string for QR codes — works with any UPI app
export const buildUpiUri = (opts: { vpa: string; payeeName: string; amount: number; note?: string }): string => {
  const params = new URLSearchParams({
    pa: opts.vpa,
    pn: opts.payeeName,
    am: opts.amount.toFixed(2),
    cu: 'INR',
    ...(opts.note ? { tn: opts.note } : {}),
  });
  return `upi://pay?${params.toString()}`;
};
