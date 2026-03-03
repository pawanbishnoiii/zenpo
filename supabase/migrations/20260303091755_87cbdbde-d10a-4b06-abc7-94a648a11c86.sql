-- Customers table for persistent customer management
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  vehicle_number TEXT,
  notes TEXT,
  visit_count INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_phone ON public.customers (business_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_business_email ON public.customers (business_id, email);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customers_business_phone_unique'
      AND conrelid = 'public.customers'::regclass
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_business_phone_unique UNIQUE (business_id, phone);
  END IF;
END $$;

CREATE POLICY "Business owners can view customers"
ON public.customers
FOR SELECT
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Business owners can create customers"
ON public.customers
FOR INSERT
WITH CHECK (is_business_owner(auth.uid(), business_id));

CREATE POLICY "Business owners can update customers"
ON public.customers
FOR UPDATE
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Business owners can delete customers"
ON public.customers
FOR DELETE
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Offers table for owner-managed promotional offers
CREATE TABLE IF NOT EXISTS public.business_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_offers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_business_offers_business_id ON public.business_offers (business_id);

CREATE POLICY "Business owners can view offers"
ON public.business_offers
FOR SELECT
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Business owners can create offers"
ON public.business_offers
FOR INSERT
WITH CHECK (is_business_owner(auth.uid(), business_id));

CREATE POLICY "Business owners can update offers"
ON public.business_offers
FOR UPDATE
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Business owners can delete offers"
ON public.business_offers
FOR DELETE
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_business_offers_updated_at ON public.business_offers;
CREATE TRIGGER update_business_offers_updated_at
BEFORE UPDATE ON public.business_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add customer reference in invoices for proper billing persistence
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices (customer_id);

-- Helper function to upsert customer on billing
CREATE OR REPLACE FUNCTION public.upsert_customer_for_invoice(
  _business_id UUID,
  _full_name TEXT,
  _phone TEXT,
  _email TEXT,
  _vehicle_number TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _customer_id UUID;
BEGIN
  IF NOT is_business_owner(auth.uid(), _business_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  IF COALESCE(TRIM(_phone), '') <> '' THEN
    SELECT id INTO _customer_id
    FROM public.customers
    WHERE business_id = _business_id
      AND phone = TRIM(_phone)
    LIMIT 1;
  ELSIF COALESCE(TRIM(_email), '') <> '' THEN
    SELECT id INTO _customer_id
    FROM public.customers
    WHERE business_id = _business_id
      AND lower(email) = lower(TRIM(_email))
    LIMIT 1;
  END IF;

  IF _customer_id IS NULL THEN
    INSERT INTO public.customers (business_id, full_name, phone, email, vehicle_number, visit_count, total_spent, last_visit_at)
    VALUES (
      _business_id,
      COALESCE(TRIM(_full_name), ''),
      NULLIF(TRIM(_phone), ''),
      NULLIF(TRIM(_email), ''),
      NULLIF(TRIM(_vehicle_number), ''),
      1,
      0,
      now()
    )
    RETURNING id INTO _customer_id;
  ELSE
    UPDATE public.customers
    SET
      full_name = CASE WHEN COALESCE(TRIM(_full_name), '') <> '' THEN TRIM(_full_name) ELSE full_name END,
      email = COALESCE(NULLIF(TRIM(_email), ''), email),
      vehicle_number = COALESCE(NULLIF(TRIM(_vehicle_number), ''), vehicle_number),
      last_visit_at = now(),
      updated_at = now()
    WHERE id = _customer_id;
  END IF;

  RETURN _customer_id;
END;
$$;

-- Seed starter catalog for car wash and spare parts
CREATE OR REPLACE FUNCTION public.seed_business_starter_catalog(_business_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _category TEXT;
  _inserted_count INTEGER := 0;
BEGIN
  IF NOT is_business_owner(auth.uid(), _business_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT category INTO _category
  FROM public.businesses
  WHERE id = _business_id;

  IF _category IS NULL THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF _category = 'car_wash' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (
        VALUES
          ('Basic Wash', 'Exterior pressure wash service', 'Services', 'SRV-CW-001', '8901000001001', 299::numeric, 249::numeric, 18::numeric, 9999),
          ('Foam Wash', 'Premium foam wash package', 'Services', 'SRV-CW-002', '8901000001002', 499::numeric, 449::numeric, 18::numeric, 9999),
          ('Interior Vacuum', 'Interior cleaning and vacuum', 'Services', 'SRV-CW-003', '8901000001003', 349::numeric, 299::numeric, 18::numeric, 9999),
          ('Ceramic Polish', 'Body polish and shine protection', 'Services', 'SRV-CW-004', '8901000001004', 1499::numeric, 1299::numeric, 18::numeric, 9999),
          ('Dashboard Polish', 'Dashboard and trim dressing', 'Accessories', 'ACC-CW-005', '8901000001005', 199::numeric, 179::numeric, 18::numeric, 100)
      ) AS x(name, description, category, sku, barcode_value, price, discount_price, tax_percent, stock)
      WHERE NOT EXISTS (
        SELECT 1 FROM public.products p WHERE p.business_id = _business_id AND p.sku = x.sku
      )
      RETURNING id
    )
    SELECT COUNT(*) INTO _inserted_count FROM seeded;
  ELSE
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (
        VALUES
          ('Engine Oil 1L', 'Synthetic engine oil 1 litre', 'Spare Parts', 'SPR-SP-001', '8902000002001', 799::numeric, 749::numeric, 18::numeric, 40),
          ('Air Filter', 'Universal air filter', 'Spare Parts', 'SPR-SP-002', '8902000002002', 499::numeric, 449::numeric, 18::numeric, 35),
          ('Brake Pads Set', 'Front brake pad set', 'Spare Parts', 'SPR-SP-003', '8902000002003', 1499::numeric, 1399::numeric, 18::numeric, 20),
          ('Bike Chain Lube', 'High performance chain lubricant', 'Accessories', 'ACC-SP-004', '8902000002004', 299::numeric, 269::numeric, 18::numeric, 60),
          ('Fitting Charges', 'Installation / labour charges', 'Labour', 'SRV-SP-005', '8902000002005', 350::numeric, 350::numeric, 18::numeric, 9999)
      ) AS x(name, description, category, sku, barcode_value, price, discount_price, tax_percent, stock)
      WHERE NOT EXISTS (
        SELECT 1 FROM public.products p WHERE p.business_id = _business_id AND p.sku = x.sku
      )
      RETURNING id
    )
    SELECT COUNT(*) INTO _inserted_count FROM seeded;
  END IF;

  RETURN _inserted_count;
END;
$$;

-- Seed existing businesses once
DO $$
DECLARE
  b RECORD;
BEGIN
  FOR b IN SELECT id FROM public.businesses LOOP
    BEGIN
      PERFORM public.seed_business_starter_catalog(b.id);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;