
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  yearly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  badge TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_label TEXT DEFAULT 'Get Started',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.subscription_plans (name, slug, tagline, monthly_price, yearly_price, badge, features, cta_label, is_popular, sort_order) VALUES
('Free', 'free', 'Everything to get started', 0, 0, NULL,
  '["Unlimited products","Basic POS billing","1 staff account","WhatsApp bill share","Cloud backup"]'::jsonb,
  'Start Free', false, 1),
('Pro', 'pro', 'For growing businesses', 499, 4990, 'MOST POPULAR',
  '["Everything in Free","Online store + themes","GST invoices & reports","Razorpay online payments","Email receipts (SMTP)","5 staff accounts","Priority support"]'::jsonb,
  'Upgrade to Pro', true, 2),
('Enterprise', 'enterprise', 'For multi-store chains', 1999, 19990, 'CUSTOM',
  '["Everything in Pro","Unlimited staff & stores","Custom domain","API access","Dedicated manager","SLA + 24/7 support"]'::jsonb,
  'Contact Sales', false, 3)
ON CONFLICT (slug) DO NOTHING;
