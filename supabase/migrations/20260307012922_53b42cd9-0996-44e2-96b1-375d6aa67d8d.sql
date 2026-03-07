
-- Make review INSERT policy slightly more restrictive - require non-empty reviewer_name
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.product_reviews;
CREATE POLICY "Anyone can submit reviews" ON public.product_reviews
FOR INSERT TO anon, authenticated
WITH CHECK (length(trim(reviewer_name)) > 0 AND rating >= 1 AND rating <= 5);
