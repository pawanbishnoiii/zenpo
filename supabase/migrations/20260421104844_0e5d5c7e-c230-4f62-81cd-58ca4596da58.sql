
-- Customer credit/udhar
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_balance numeric NOT NULL DEFAULT 0;

-- Business GST + invoice settings
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS gst_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS default_tax_percent numeric NOT NULL DEFAULT 18;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS invoice_prefix text NOT NULL DEFAULT 'INV';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS invoice_footer text NOT NULL DEFAULT 'Thank you for your business!';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS razorpay_link_default boolean NOT NULL DEFAULT false;

-- Staff table for staff & access
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  full_name text NOT NULL,
  pin text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own staff"
ON public.staff FOR ALL TO authenticated
USING (is_business_owner(auth.uid(), business_id))
WITH CHECK (is_business_owner(auth.uid(), business_id));
