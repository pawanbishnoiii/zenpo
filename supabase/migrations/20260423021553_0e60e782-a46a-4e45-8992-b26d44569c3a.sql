
-- App releases table
CREATE TABLE IF NOT EXISTS public.app_releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  changelog TEXT NOT NULL DEFAULT '',
  is_latest BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view releases"
ON public.app_releases FOR SELECT
USING (true);

CREATE POLICY "Admins can insert releases"
ON public.app_releases FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update releases"
ON public.app_releases FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete releases"
ON public.app_releases FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for APK files (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-releases', 'app-releases', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read app releases"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-releases');

CREATE POLICY "Admins can upload app releases"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-releases' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update app releases"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'app-releases' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete app releases"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-releases' AND has_role(auth.uid(), 'admin'::app_role));

-- Helper to mark a release as latest (unsets others atomically)
CREATE OR REPLACE FUNCTION public.set_latest_release(_release_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  UPDATE public.app_releases SET is_latest = false WHERE is_latest = true;
  UPDATE public.app_releases SET is_latest = true WHERE id = _release_id;
END;
$$;
