
-- Add brand_name to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_name text DEFAULT '';

-- Add vehicle_type to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS vehicle_type text DEFAULT '';

-- Add coupon_code to business_offers
ALTER TABLE public.business_offers ADD COLUMN IF NOT EXISTS coupon_code text DEFAULT '';

-- Add brand_name to gallery_products  
ALTER TABLE public.gallery_products ADD COLUMN IF NOT EXISTS brand_name text DEFAULT '';
