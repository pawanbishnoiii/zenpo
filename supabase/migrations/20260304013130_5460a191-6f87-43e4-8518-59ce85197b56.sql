
-- Add store_slug to businesses for individual store links
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS store_slug text UNIQUE;

-- Create index for store_slug lookups
CREATE INDEX IF NOT EXISTS idx_businesses_store_slug ON public.businesses(store_slug) WHERE store_slug IS NOT NULL;

-- Admin gallery table for shared product templates
CREATE TABLE IF NOT EXISTS public.gallery_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  price numeric NOT NULL DEFAULT 0,
  discount_price numeric NOT NULL DEFAULT 0,
  tax_percent numeric NOT NULL DEFAULT 18,
  image_url text DEFAULT '',
  barcode_value text DEFAULT '',
  sku text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_products ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read gallery
CREATE POLICY "Authenticated users can view gallery" ON public.gallery_products
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage gallery
CREATE POLICY "Admins can manage gallery" ON public.gallery_products
  FOR ALL USING (has_role(auth.uid(), 'admin'));
