
-- Unique store slug index
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_store_slug_unique ON public.businesses (store_slug) WHERE store_slug IS NOT NULL AND store_slug != '';

-- Function to check slug availability
CREATE OR REPLACE FUNCTION public.check_slug_available(_slug text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.businesses WHERE store_slug = _slug
  )
$$;

-- Function for public store page (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_store_by_slug(_slug text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _biz json;
  _products json;
  _biz_id uuid;
BEGIN
  SELECT id INTO _biz_id FROM businesses WHERE store_slug = _slug LIMIT 1;
  IF _biz_id IS NULL THEN RETURN NULL; END IF;

  SELECT row_to_json(b) INTO _biz FROM (
    SELECT id, business_name, category, phone, address, logo_url, store_slug FROM businesses WHERE id = _biz_id
  ) b;

  SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json) INTO _products FROM (
    SELECT id, name, description, category, price, discount_price, image_url FROM products WHERE business_id = _biz_id ORDER BY name
  ) p;

  RETURN json_build_object('business', _biz, 'products', _products);
END;
$$;

-- Gallery products: allow authenticated users to view (fix policy if restrictive)
DROP POLICY IF EXISTS "Authenticated users can view gallery" ON public.gallery_products;
CREATE POLICY "Authenticated users can view gallery" ON public.gallery_products
  FOR SELECT TO authenticated USING (true);
