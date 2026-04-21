-- Payment settings table for Razorpay (per-business)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE,
  razorpay_key_id text NOT NULL DEFAULT '',
  razorpay_key_secret text NOT NULL DEFAULT '',
  business_display_name text NOT NULL DEFAULT '',
  payment_description text NOT NULL DEFAULT 'Payment for invoice',
  is_enabled boolean NOT NULL DEFAULT false,
  is_test_mode boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own payment settings"
ON public.payment_settings FOR SELECT TO authenticated
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can create own payment settings"
ON public.payment_settings FOR INSERT TO authenticated
WITH CHECK (is_business_owner(auth.uid(), business_id));

CREATE POLICY "Owners can update own payment settings"
ON public.payment_settings FOR UPDATE TO authenticated
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can delete own payment settings"
ON public.payment_settings FOR DELETE TO authenticated
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();