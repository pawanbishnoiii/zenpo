
-- Store media table for owner uploads (images, videos, banners)
CREATE TABLE public.store_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  title text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own media" ON public.store_media
  FOR ALL TO authenticated
  USING (is_business_owner(auth.uid(), business_id))
  WITH CHECK (is_business_owner(auth.uid(), business_id));

CREATE POLICY "Public can view active media" ON public.store_media
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Store content table for custom sections
CREATE TABLE public.store_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  section_key text NOT NULL DEFAULT 'about',
  title text DEFAULT '',
  content text DEFAULT '',
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, section_key)
);

ALTER TABLE public.store_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own content" ON public.store_content
  FOR ALL TO authenticated
  USING (is_business_owner(auth.uid(), business_id))
  WITH CHECK (is_business_owner(auth.uid(), business_id));

CREATE POLICY "Public can view visible content" ON public.store_content
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);

-- Storage bucket for store media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('store-media', 'store-media', true);

CREATE POLICY "Owners can upload store media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'store-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update store media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'store-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete store media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'store-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view store media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'store-media');
