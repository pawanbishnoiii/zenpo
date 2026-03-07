
-- Product images table for multiple product images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product owners can manage images" ON public.product_images
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.businesses b ON b.id = p.business_id
  WHERE p.id = product_images.product_id AND b.owner_id = auth.uid()
));

CREATE POLICY "Public can view images" ON public.product_images
FOR SELECT TO anon, authenticated
USING (true);

-- Product reviews table - public can write, owner/admin approves
CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL DEFAULT '',
  reviewer_email text,
  rating integer NOT NULL DEFAULT 5,
  review_text text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert reviews (public)
CREATE POLICY "Anyone can submit reviews" ON public.product_reviews
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Public can see approved reviews
CREATE POLICY "Public can view approved reviews" ON public.product_reviews
FOR SELECT TO anon, authenticated
USING (is_approved = true);

-- Business owners can view all reviews for their business
CREATE POLICY "Owners can view all reviews" ON public.product_reviews
FOR SELECT TO authenticated
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Business owners can update (approve/reject)
CREATE POLICY "Owners can update reviews" ON public.product_reviews
FOR UPDATE TO authenticated
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Business owners can delete reviews
CREATE POLICY "Owners can delete reviews" ON public.product_reviews
FOR DELETE TO authenticated
USING (is_business_owner(auth.uid(), business_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Add store_theme column to businesses for store page theme
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS store_theme text DEFAULT 'suspended';

-- Update get_store_by_slug to include store_theme and reviews
CREATE OR REPLACE FUNCTION public.get_store_by_slug(_slug text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _biz json;
  _products json;
  _reviews json;
  _biz_id uuid;
BEGIN
  SELECT id INTO _biz_id FROM businesses WHERE store_slug = _slug LIMIT 1;
  IF _biz_id IS NULL THEN RETURN NULL; END IF;

  SELECT row_to_json(b) INTO _biz FROM (
    SELECT id, business_name, category, phone, address, logo_url, store_slug, store_theme FROM businesses WHERE id = _biz_id
  ) b;

  SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json) INTO _products FROM (
    SELECT p.id, p.name, p.description, p.category, p.price, p.discount_price, p.image_url, p.brand_name,
      COALESCE((SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'sort_order', pi.sort_order) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id), '[]'::json) as images
    FROM products p WHERE p.business_id = _biz_id ORDER BY p.name
  ) p;

  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json) INTO _reviews FROM (
    SELECT id, product_id, reviewer_name, rating, review_text, created_at
    FROM product_reviews WHERE business_id = _biz_id AND is_approved = true ORDER BY created_at DESC LIMIT 20
  ) r;

  RETURN json_build_object('business', _biz, 'products', _products, 'reviews', _reviews);
END;
$$;

-- Update seed function to be truly category-specific
CREATE OR REPLACE FUNCTION public.seed_business_starter_catalog(_business_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _category TEXT;
  _inserted_count INTEGER := 0;
BEGIN
  IF NOT is_business_owner(auth.uid(), _business_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT category INTO _category FROM public.businesses WHERE id = _business_id;
  IF _category IS NULL THEN RAISE EXCEPTION 'Business not found'; END IF;

  IF _category = 'car_wash' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Basic Wash','Exterior pressure wash','Services','SRV-CW-001','8901000001001',299::numeric,249::numeric,18::numeric,9999),
        ('Foam Wash','Premium foam wash','Services','SRV-CW-002','8901000001002',499::numeric,449::numeric,18::numeric,9999),
        ('Interior Vacuum','Interior deep clean','Services','SRV-CW-003','8901000001003',349::numeric,299::numeric,18::numeric,9999),
        ('Ceramic Polish','Body polish & shine','Packages','SRV-CW-004','8901000001004',1499::numeric,1299::numeric,18::numeric,9999),
        ('Dashboard Polish','Dashboard & trim care','Accessories','ACC-CW-005','8901000001005',199::numeric,179::numeric,18::numeric,100)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'grocery' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Tata Salt 1kg','Iodised salt','Grocery','GRO-001','8901234001001',28::numeric,25::numeric,5::numeric,200),
        ('Amul Butter 500g','Fresh butter','Dairy','GRO-002','8901234001002',270::numeric,255::numeric,5::numeric,50),
        ('Maggi Noodles','Instant noodles pack','Snacks','GRO-003','8901234001003',14::numeric,12::numeric,12::numeric,300),
        ('Surf Excel 1kg','Detergent powder','Household','GRO-004','8901234001004',220::numeric,199::numeric,18::numeric,80),
        ('Parle-G Biscuit','Glucose biscuit pack','Snacks','GRO-005','8901234001005',10::numeric,10::numeric,5::numeric,500)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'medical' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Paracetamol 500mg','Fever & pain relief strip','Medicines','MED-001','8901345001001',30::numeric,25::numeric,12::numeric,500),
        ('Crocin Advance','Pain relief tablet','Medicines','MED-002','8901345001002',45::numeric,40::numeric,12::numeric,300),
        ('Dettol Antiseptic','Antiseptic liquid 250ml','OTC','MED-003','8901345001003',120::numeric,110::numeric,18::numeric,100),
        ('Band-Aid Box','Adhesive bandage box','Health Devices','MED-004','8901345001004',85::numeric,75::numeric,18::numeric,150),
        ('ORS Sachet','Oral rehydration salts','OTC','MED-005','8901345001005',22::numeric,20::numeric,5::numeric,400)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'electronics' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('USB-C Cable 1m','Fast charging cable','Accessories','ELC-001','8901456001001',299::numeric,249::numeric,18::numeric,200),
        ('Wireless Earbuds','Bluetooth earbuds','Audio','ELC-002','8901456001002',1299::numeric,999::numeric,18::numeric,50),
        ('Phone Tempered Glass','Screen protector','Accessories','ELC-003','8901456001003',199::numeric,149::numeric,18::numeric,300),
        ('Phone Case Universal','Silicone back cover','Accessories','ELC-004','8901456001004',149::numeric,99::numeric,18::numeric,250),
        ('Power Bank 10000mAh','Portable charger','Mobile','ELC-005','8901456001005',999::numeric,799::numeric,18::numeric,60)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'clothing' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Cotton T-Shirt','Round neck tee','Men','CLT-001','8901567001001',499::numeric,399::numeric,12::numeric,100),
        ('Slim Fit Jeans','Denim jeans','Men','CLT-002','8901567001002',1299::numeric,999::numeric,12::numeric,60),
        ('Kurti Set','Designer kurti','Women','CLT-003','8901567001003',899::numeric,699::numeric,12::numeric,80),
        ('Sports Shoes','Running shoes','Footwear','CLT-004','8901567001004',1999::numeric,1499::numeric,18::numeric,40),
        ('Silk Scarf','Fashion accessory','Accessories','CLT-005','8901567001005',399::numeric,349::numeric,12::numeric,120)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'restaurant' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Masala Chai','Hot tea with spices','Beverages','RST-001','8901678001001',30::numeric,25::numeric,5::numeric,9999),
        ('Paneer Tikka','Grilled cottage cheese','Starters','RST-002','8901678001002',280::numeric,250::numeric,5::numeric,9999),
        ('Butter Chicken','Creamy chicken curry','Main Course','RST-003','8901678001003',350::numeric,320::numeric,5::numeric,9999),
        ('Gulab Jamun','Indian dessert 2pcs','Desserts','RST-004','8901678001004',80::numeric,70::numeric,5::numeric,9999),
        ('Veg Thali','Complete meal','Combos','RST-005','8901678001005',199::numeric,179::numeric,5::numeric,9999)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'salon' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Haircut Men','Basic haircut','Haircut','SLN-001','8901789001001',200::numeric,180::numeric,18::numeric,9999),
        ('Hair Spa','Deep conditioning treatment','Skin Care','SLN-002','8901789001002',999::numeric,799::numeric,18::numeric,9999),
        ('Facial Gold','Gold facial treatment','Skin Care','SLN-003','8901789001003',1500::numeric,1200::numeric,18::numeric,9999),
        ('Manicure','Nail care service','Nail Art','SLN-004','8901789001004',500::numeric,400::numeric,18::numeric,9999),
        ('Full Body Massage','60 min relaxation','Spa','SLN-005','8901789001005',2000::numeric,1800::numeric,18::numeric,9999)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'fruits_veg' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Apple Shimla 1kg','Fresh red apples','Fruits','FV-001','8901890001001',180::numeric,160::numeric,0::numeric,100),
        ('Banana Dozen','Yellow bananas','Fruits','FV-002','8901890001002',50::numeric,40::numeric,0::numeric,200),
        ('Tomato 1kg','Fresh tomatoes','Vegetables','FV-003','8901890001003',40::numeric,35::numeric,0::numeric,150),
        ('Onion 1kg','Red onions','Vegetables','FV-004','8901890001004',35::numeric,30::numeric,0::numeric,200),
        ('Coriander Bunch','Fresh coriander','Herbs','FV-005','8901890001005',10::numeric,10::numeric,0::numeric,300)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'hardware' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Hammer 500g','Steel claw hammer','Tools','HW-001','8901901001001',350::numeric,299::numeric,18::numeric,50),
        ('PVC Pipe 1inch','Plumbing pipe per foot','Plumbing','HW-002','8901901001002',45::numeric,40::numeric,18::numeric,500),
        ('Asian Paint 1L','Interior emulsion','Paint','HW-003','8901901001003',450::numeric,399::numeric,18::numeric,30),
        ('Wire 1mm Roll','Electrical copper wire','Electrical','HW-004','8901901001004',890::numeric,799::numeric,18::numeric,40),
        ('Cement 50kg','OPC 43 grade bag','Building Material','HW-005','8901901001005',380::numeric,360::numeric,28::numeric,100)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'pet_store' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Pedigree 3kg','Adult dog food','Dog','PET-001','8902012001001',750::numeric,699::numeric,18::numeric,40),
        ('Whiskas 1.2kg','Cat food ocean fish','Cat','PET-002','8902012001002',450::numeric,399::numeric,18::numeric,35),
        ('Dog Leash','Nylon adjustable leash','Accessories','PET-003','8902012001003',299::numeric,249::numeric,18::numeric,60),
        ('Cat Litter 5kg','Clumping cat litter','Cat','PET-004','8902012001004',550::numeric,499::numeric,18::numeric,30),
        ('Fish Food 100g','Tropical fish pellets','Fish','PET-005','8902012001005',180::numeric,150::numeric,18::numeric,80)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'stationery' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Classmate Notebook','Single line 200 pages','Notebooks','STN-001','8902123001001',60::numeric,50::numeric,12::numeric,200),
        ('Reynolds Pen Pack','10 blue ball pens','Pens','STN-002','8902123001002',100::numeric,85::numeric,12::numeric,300),
        ('Fevicol 200g','White adhesive','Art Supplies','STN-003','8902123001003',65::numeric,55::numeric,18::numeric,150),
        ('Drawing Book A4','Blank sketch book','Art Supplies','STN-004','8902123001004',45::numeric,40::numeric,12::numeric,180),
        ('Geometry Box','Complete compass set','School Kits','STN-005','8902123001005',120::numeric,99::numeric,18::numeric,100)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSIF _category = 'bakery' THEN
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Chocolate Cake 1kg','Rich chocolate cake','Cakes','BKR-001','8902234001001',800::numeric,699::numeric,5::numeric,20),
        ('Puff Pastry','Veg puff','Pastries','BKR-002','8902234001002',30::numeric,25::numeric,5::numeric,100),
        ('Butter Cookies 250g','Danish style cookies','Cookies','BKR-003','8902234001003',180::numeric,150::numeric,12::numeric,80),
        ('Gulab Jamun 1kg','Traditional sweet','Sweets','BKR-004','8902234001004',400::numeric,350::numeric,5::numeric,40),
        ('Fresh Bread Loaf','White bread 400g','Bread','BKR-005','8902234001005',45::numeric,40::numeric,0::numeric,100)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;

  ELSE
    -- spare_parts, food_stall, custom, and others
    WITH seeded AS (
      INSERT INTO public.products (business_id, name, description, category, sku, barcode_value, qr_value, price, discount_price, tax_percent, stock)
      SELECT _business_id, x.name, x.description, x.category, x.sku, x.barcode_value, x.barcode_value, x.price, x.discount_price, x.tax_percent, x.stock
      FROM (VALUES
        ('Sample Product 1','Your first product','General','GEN-001','8900000000001',100::numeric,90::numeric,18::numeric,50),
        ('Sample Product 2','Another product','General','GEN-002','8900000000002',200::numeric,180::numeric,18::numeric,30),
        ('Sample Service','Service item','Services','GEN-003','8900000000003',500::numeric,450::numeric,18::numeric,9999)
      ) AS x(name,description,category,sku,barcode_value,price,discount_price,tax_percent,stock)
      WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.business_id=_business_id AND p.sku=x.sku)
      RETURNING id
    ) SELECT COUNT(*) INTO _inserted_count FROM seeded;
  END IF;

  RETURN _inserted_count;
END;
$$;
