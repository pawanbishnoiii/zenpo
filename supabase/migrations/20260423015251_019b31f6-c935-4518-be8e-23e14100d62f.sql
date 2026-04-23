
-- 1. Admin global payment settings (singleton row)
CREATE TABLE public.admin_payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  razorpay_key_id text NOT NULL DEFAULT '',
  razorpay_key_secret text NOT NULL DEFAULT '',
  razorpay_webhook_secret text NOT NULL DEFAULT '',
  is_test_mode boolean NOT NULL DEFAULT true,
  is_enabled boolean NOT NULL DEFAULT false,
  default_commission_percent numeric NOT NULL DEFAULT 2.0,
  payout_time_window text NOT NULL DEFAULT '04:00-06:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payment settings" ON public.admin_payment_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed singleton row
INSERT INTO public.admin_payment_settings (singleton) VALUES (true) ON CONFLICT DO NOTHING;

-- 2. Add UPI + commission override to businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS upi_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS commission_percent_override numeric;

-- 3. Payment transactions log
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  invoice_id uuid,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_payment_link_id text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  method text,
  status text NOT NULL DEFAULT 'created',
  flow text NOT NULL DEFAULT 'checkout',
  commission_percent numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  owner_net_amount numeric NOT NULL DEFAULT 0,
  settlement_id uuid,
  is_test_mode boolean NOT NULL DEFAULT true,
  raw_event jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_transactions_business ON public.payment_transactions(business_id, created_at DESC);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_settlement ON public.payment_transactions(settlement_id);
CREATE UNIQUE INDEX uq_payment_transactions_order ON public.payment_transactions(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own transactions" ON public.payment_transactions
  FOR SELECT TO authenticated
  USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners insert own transactions" ON public.payment_transactions
  FOR INSERT TO authenticated
  WITH CHECK (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update transactions" ON public.payment_transactions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Daily settlements
CREATE TABLE public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  gross_amount numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  txn_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payout_method text DEFAULT 'manual',
  razorpay_payout_id text,
  notes text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_settlements_business ON public.settlements(business_id, period_end DESC);
CREATE INDEX idx_settlements_status ON public.settlements(status);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own settlements" ON public.settlements
  FOR SELECT TO authenticated
  USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage settlements" ON public.settlements
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Updated_at triggers
CREATE TRIGGER trg_admin_payment_settings_updated BEFORE UPDATE ON public.admin_payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_payment_transactions_updated BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_settlements_updated BEFORE UPDATE ON public.settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Aggregator function for daily settlement (called by cron)
CREATE OR REPLACE FUNCTION public.aggregate_daily_settlements(_period_start timestamptz, _period_end timestamptz)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer := 0;
  _row record;
  _settlement_id uuid;
BEGIN
  FOR _row IN
    SELECT business_id,
           SUM(amount) AS gross,
           SUM(commission_amount) AS commission,
           SUM(owner_net_amount) AS net,
           COUNT(*) AS cnt
    FROM payment_transactions
    WHERE status = 'paid'
      AND settlement_id IS NULL
      AND created_at >= _period_start
      AND created_at < _period_end
    GROUP BY business_id
  LOOP
    INSERT INTO settlements (business_id, period_start, period_end, gross_amount, commission_amount, net_amount, txn_count, status)
    VALUES (_row.business_id, _period_start, _period_end, _row.gross, _row.commission, _row.net, _row.cnt, 'pending')
    RETURNING id INTO _settlement_id;

    UPDATE payment_transactions
    SET settlement_id = _settlement_id
    WHERE business_id = _row.business_id
      AND status = 'paid'
      AND settlement_id IS NULL
      AND created_at >= _period_start
      AND created_at < _period_end;

    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;
