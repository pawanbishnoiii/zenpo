DROP POLICY IF EXISTS "Admin manage email log" ON public.email_log;
CREATE POLICY "Admin manage email log" ON public.email_log
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));