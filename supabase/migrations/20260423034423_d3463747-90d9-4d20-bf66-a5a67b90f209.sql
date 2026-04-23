-- Razorpay: split keys into test/live + active mode
ALTER TABLE public.admin_payment_settings
  ADD COLUMN IF NOT EXISTS test_key_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS test_key_secret TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS live_key_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS live_key_secret TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS active_mode TEXT NOT NULL DEFAULT 'test';

-- Backfill: if existing key_id starts with rzp_live, store as live, else test
UPDATE public.admin_payment_settings
SET test_key_id = CASE WHEN razorpay_key_id LIKE 'rzp_test_%' THEN razorpay_key_id ELSE test_key_id END,
    test_key_secret = CASE WHEN razorpay_key_id LIKE 'rzp_test_%' THEN razorpay_key_secret ELSE test_key_secret END,
    live_key_id = CASE WHEN razorpay_key_id LIKE 'rzp_live_%' THEN razorpay_key_id ELSE live_key_id END,
    live_key_secret = CASE WHEN razorpay_key_id LIKE 'rzp_live_%' THEN razorpay_key_secret ELSE live_key_secret END,
    active_mode = CASE WHEN razorpay_key_id LIKE 'rzp_live_%' AND is_test_mode = false THEN 'live' ELSE 'test' END
WHERE razorpay_key_id IS NOT NULL AND razorpay_key_id <> '';

-- Customer credit adjustments log (signed amount: + adds credit owed, - reduces)
CREATE TABLE IF NOT EXISTS public.customer_credit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  invoice_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_credit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners view own credit log" ON public.customer_credit_log;
CREATE POLICY "Owners view own credit log" ON public.customer_credit_log
  FOR SELECT TO authenticated USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Owners insert own credit log" ON public.customer_credit_log;
CREATE POLICY "Owners insert own credit log" ON public.customer_credit_log
  FOR INSERT TO authenticated WITH CHECK (is_business_owner(auth.uid(), business_id));

-- Email send log (SMTP attempts)
CREATE TABLE IF NOT EXISTS public.email_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID,
  invoice_id UUID,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'smtp',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners view own email log" ON public.email_log;
CREATE POLICY "Owners view own email log" ON public.email_log
  FOR SELECT TO authenticated USING (
    business_id IS NULL AND has_role(auth.uid(), 'admin'::app_role)
    OR is_business_owner(auth.uid(), business_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  );
DROP POLICY IF EXISTS "Admin manage email log" ON public.email_log;
CREATE POLICY "Admin manage email log" ON public.email_log
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (true);

-- RPC: adjust customer credit atomically + log
CREATE OR REPLACE FUNCTION public.adjust_customer_credit(
  _business_id UUID,
  _customer_id UUID,
  _amount NUMERIC,
  _reason TEXT,
  _invoice_id UUID DEFAULT NULL
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance NUMERIC;
BEGIN
  IF NOT is_business_owner(auth.uid(), _business_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  UPDATE public.customers
    SET credit_balance = COALESCE(credit_balance, 0) + _amount,
        updated_at = now()
    WHERE id = _customer_id AND business_id = _business_id
    RETURNING credit_balance INTO _new_balance;
  INSERT INTO public.customer_credit_log (business_id, customer_id, amount, reason, invoice_id, created_by)
    VALUES (_business_id, _customer_id, _amount, COALESCE(_reason, ''), _invoice_id, auth.uid());
  RETURN _new_balance;
END;
$$;