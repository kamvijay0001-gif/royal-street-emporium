
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;

-- SETTINGS
INSERT INTO public.store_settings (key, value) VALUES
 ('store', '{"name":"Royal Street Mini Mall","tagline":"Premium Street Fashion","phone":"+917015973927","whatsapp":"917015973927","email":"royalstreet99@gmail.com","instagram":"https://instagram.com/royalstreet99","address":"Shop No. 65, HUDA Market, Near Burger Hut, Sukhrali, Sector 17, Gurugram, Haryana – 122007","city":"Gurugram","state":"Haryana","pincode":"122007","hours":"Mon–Sun, 10:00 AM – 9:30 PM"}'::jsonb),
 ('payments', '{"upi_id":"9053346151@upi","upi_name":"Royal Street Mini Mall","cod_fee":99,"gateway":"razorpay","gateway_enabled":false}'::jsonb),
 ('delivery', '{"delivery_fee":50,"free_delivery_threshold":999,"default_eta_days":5}'::jsonb),
 ('policies', '{"shipping":"Orders are dispatched within 24-48 hours of confirmation. Standard delivery takes 3-7 working days depending on your PIN code. Delivery is free on prepaid orders above the free delivery threshold shown at checkout.","returns":"Returns and exchanges are accepted within 7 days of delivery, provided the product is unused, unwashed and has all original tags intact. Watches must be returned with original packaging.","refunds":"Approved refunds are processed to the original payment method within 5-7 working days of the returned item reaching our store. Cash on Delivery orders are refunded by bank transfer or UPI.","privacy":"We collect only the information required to create your account, process your order, deliver it and support you. We never sell your data. Payment details are handled by the payment gateway and are never stored on our servers.","terms":"By placing an order you confirm that the information provided is accurate. Prices, offers and availability may change without notice. All disputes are subject to the jurisdiction of Gurugram, Haryana.","cancellation":"Orders can be cancelled free of charge before they are shipped from the account section or by calling the store. Once shipped, an order can only be returned after delivery."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- CATEGORIES
INSERT INTO public.categories (name, slug, position, image_url) VALUES
 ('Men','men',1,'/images/cat-men.jpg'),
 ('Women','women',2,'/images/cat-women.jpg'),
 ('Watches','watches',3,'/images/cat-watches.jpg'),
 ('Accessories','accessories',4,'/images/cat-accessories.jpg');

INSERT INTO public.categories (name, slug, parent_id, position)
SELECT s.name, s.slug, c.id, s.pos FROM public.categories c
JOIN (VALUES
 ('men','T-Shirts','men-t-shirts',1),('men','Shirts','men-shirts',2),('men','Jeans','men-jeans',3),
 ('men','Trousers','men-trousers',4),('men','Jackets','men-jackets',5),('men','Hoodies','men-hoodies',6),
 ('men','Ethnic Wear','men-ethnic-wear',7),
 ('women','Tops','women-tops',1),('women','Dresses','women-dresses',2),('women','Jeans','women-jeans',3),
 ('women','Kurtis','women-kurtis',4),('women','Ethnic Wear','women-ethnic-wear',5),('women','Co-ords','women-co-ords',6),
 ('women','Jackets','women-jackets',7),
 ('watches','Men''s Watches','mens-watches',1),('watches','Women''s Watches','womens-watches',2),
 ('watches','Analog','analog-watches',3),('watches','Digital','digital-watches',4),('watches','Premium Watches','premium-watches',5),
 ('accessories','Belts','belts',1),('accessories','Caps','caps',2),('accessories','Sunglasses','sunglasses',3),('accessories','Wallets','wallets',4)
) AS s(parent, name, slug, pos) ON s.parent = c.slug;

-- PINCODES
INSERT INTO public.serviceable_pincodes (pincode, city, state, cod_available, eta_days) VALUES
 ('122001','Gurugram','Haryana',true,2),('122002','Gurugram','Haryana',true,2),
 ('122003','Gurugram','Haryana',true,2),('122007','Gurugram','Haryana',true,1),
 ('122008','Gurugram','Haryana',true,2),('122011','Gurugram','Haryana',true,2),
 ('122015','Gurugram','Haryana',true,2),('122017','Gurugram','Haryana',true,2),
 ('110001','New Delhi','Delhi',true,3),('110016','New Delhi','Delhi',true,3),
 ('110037','New Delhi','Delhi',true,3),('110070','New Delhi','Delhi',true,3),
 ('201301','Noida','Uttar Pradesh',true,4),('201304','Noida','Uttar Pradesh',true,4),
 ('121001','Faridabad','Haryana',true,3),('124001','Rohtak','Haryana',true,4),
 ('160017','Chandigarh','Chandigarh',true,5),('302001','Jaipur','Rajasthan',true,5),
 ('400001','Mumbai','Maharashtra',true,6),('560001','Bengaluru','Karnataka',true,6);

-- COUPONS
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order, max_discount, per_customer_limit) VALUES
 ('WELCOME10','10% off your first order','percent',10,999,500,1),
 ('ROYAL200','Flat ₹200 off above ₹2499','fixed',200,2499,NULL,3);

-- SAMPLE PRODUCTS
WITH cat AS (SELECT id, slug FROM public.categories),
ins AS (
  INSERT INTO public.products (name, slug, sku, brand, description, material, care_instructions, category_id, subcategory_id, mrp, price, is_active, is_featured, is_new_arrival, is_best_seller, sold_count, size_chart)
  SELECT p.name, p.slug, p.sku, p.brand, p.description, p.material, p.care,
         (SELECT id FROM cat WHERE slug = p.cat), (SELECT id FROM cat WHERE slug = p.sub),
         p.mrp, p.price, true, p.featured, p.newa, p.best, p.sold,
         '{"note":"Measurements in inches. Model is 6ft wearing size L.","rows":[{"size":"S","chest":"38","length":"27"},{"size":"M","chest":"40","length":"28"},{"size":"L","chest":"42","length":"29"},{"size":"XL","chest":"44","length":"30"},{"size":"XXL","chest":"46","length":"31"}]}'::jsonb
  FROM (VALUES
   ('Premium Black Oversized T-Shirt','mens-black-premium-oversized-tshirt','RS-MT-001','Royal Street','A heavyweight 240 GSM oversized tee with a structured drop shoulder and a deep matte black finish that holds its colour wash after wash.','100% Combed Cotton','Machine wash cold, do not bleach, tumble dry low','men','men-t-shirts',1499,899,true,true,true,48),
   ('Classic White Shirt','mens-classic-white-shirt','RS-MS-002','Royal Street','A crisp full-sleeve white shirt cut for a clean modern fit. Works for office, evenings and everything in between.','Cotton Poplin','Machine wash cold, warm iron','men','men-shirts',2199,1299,true,false,true,31),
   ('Men''s Slim Fit Denim Jeans','mens-slim-fit-denim-jeans','RS-MJ-003','Royal Street','Mid-rise slim fit jeans in a stretchable indigo denim with clean stitch detailing and a comfortable all-day fit.','98% Cotton, 2% Elastane','Machine wash inside out, do not bleach','men','men-jeans',2999,1699,true,true,false,64),
   ('Premium Casual Shirt','mens-premium-casual-shirt','RS-MS-004','Royal Street','A textured casual shirt in a soft charcoal tone with a relaxed collar and mother-of-pearl style buttons.','Cotton Blend','Machine wash cold, mild iron','men','men-shirts',1999,1149,false,false,true,22),
   ('Women''s Casual Midi Dress','womens-casual-midi-dress','RS-WD-005','Royal Street','A flowy midi dress with a flattering waist tie and soft drape, made for brunches and easy evenings.','Rayon Crepe','Hand wash cold, dry in shade','women','women-dresses',2499,1399,true,true,true,57),
   ('Women''s High Rise Denim','womens-high-rise-denim','RS-WJ-006','Royal Street','High rise straight leg denim with a sculpting waistband and a clean ankle length finish.','Cotton Stretch Denim','Machine wash cold','women','women-jeans',2799,1599,true,false,false,29),
   ('Premium Analog Watch','premium-analog-watch-rose-gold','RS-WT-007','Royal Street','A premium analog watch with a sunray dial, sapphire-coated glass and a solid stainless steel bracelet.','Stainless Steel','Avoid contact with perfume, wipe with dry cloth','watches','premium-watches',5999,2999,true,true,true,73),
   ('Classic Men''s Leather Watch','classic-mens-leather-watch','RS-WT-008','Royal Street','A minimal everyday analog watch with a genuine leather strap and a 3 ATM water resistant case.','Leather & Steel','Keep strap dry, service every 2 years','watches','mens-watches',3999,1899,false,false,true,41),
   ('Women''s Fashion Watch','womens-fashion-watch','RS-WT-009','Royal Street','A slim mesh-strap watch designed to sit light on the wrist with a soft pearl dial.','Mesh Steel','Wipe with dry cloth','watches','womens-watches',3499,1699,true,false,false,18)
  ) AS p(name, slug, sku, brand, description, material, care, cat, sub, mrp, price, featured, newa, best, sold)
  RETURNING id, slug
)
INSERT INTO public.product_images (product_id, url, alt, position, is_primary)
SELECT ins.id, '/images/products/' || ins.slug || '.jpg', ins.slug, 0, true FROM ins;

-- VARIANTS
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock)
SELECT p.id, p.sku || '-' || upper(left(c.color,2)) || '-' || v.size, v.size, c.color, c.hex, v.stock
FROM public.products p
CROSS JOIN (VALUES ('Black','#111111',0),('White','#FFFFFF',1)) AS c(color, hex, idx)
CROSS JOIN (VALUES ('S',5),('M',8),('L',0),('XL',4),('XXL',6)) AS v(size, stock)
WHERE p.slug IN ('mens-black-premium-oversized-tshirt','mens-classic-white-shirt','mens-premium-casual-shirt','womens-casual-midi-dress');

INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock)
SELECT p.id, p.sku || '-BL-' || v.size, v.size, 'Blue', '#2A3A5A', v.stock
FROM public.products p
CROSS JOIN (VALUES ('28',4),('30',7),('32',9),('34',3),('36',0)) AS v(size, stock)
WHERE p.slug IN ('mens-slim-fit-denim-jeans','womens-high-rise-denim');

INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock)
SELECT p.id, p.sku || '-' || upper(left(c.color,2)), 'One Size', c.color, c.hex, c.stock
FROM public.products p
CROSS JOIN (VALUES ('Black','#111111',6),('Silver','#C9CBD1',4),('Rose Gold','#B76E79',2)) AS c(color, hex, stock)
WHERE p.slug IN ('premium-analog-watch-rose-gold','classic-mens-leather-watch','womens-fashion-watch');

-- SECURE SERVER-SIDE CHECKOUT
CREATE OR REPLACE FUNCTION public.place_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_item jsonb;
  v_variant public.product_variants%ROWTYPE;
  v_product public.products%ROWTYPE;
  v_price numeric;
  v_subtotal numeric := 0;
  v_mrp_total numeric := 0;
  v_coupon public.coupons%ROWTYPE;
  v_coupon_discount numeric := 0;
  v_delivery numeric := 0;
  v_cod numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_number text;
  v_method text := coalesce(payload->>'payment_method','cod');
  v_settings_pay jsonb;
  v_settings_del jsonb;
  v_image text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'You must be signed in to place an order'; END IF;
  IF jsonb_array_length(coalesce(payload->'items','[]'::jsonb)) = 0 THEN RAISE EXCEPTION 'Your cart is empty'; END IF;

  SELECT value INTO v_settings_pay FROM public.store_settings WHERE key = 'payments';
  SELECT value INTO v_settings_del FROM public.store_settings WHERE key = 'delivery';

  v_number := 'RSM' || to_char(now(),'YYMM') || nextval('public.order_number_seq');

  INSERT INTO public.orders (order_number, user_id, customer_name, customer_phone, customer_email, customer_whatsapp, shipping_address, payment_method, payment_status, status, total)
  VALUES (v_number, v_user,
    payload->'customer'->>'name', payload->'customer'->>'phone',
    payload->'customer'->>'email', payload->'customer'->>'whatsapp',
    payload->'address', v_method, 'pending', 'pending_payment', 0)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    SELECT * INTO v_variant FROM public.product_variants
      WHERE id = (v_item->>'variant_id')::uuid FOR UPDATE;
    IF NOT FOUND OR NOT v_variant.is_active THEN RAISE EXCEPTION 'A selected item is no longer available'; END IF;
    SELECT * INTO v_product FROM public.products WHERE id = v_variant.product_id;
    IF NOT FOUND OR NOT v_product.is_active THEN RAISE EXCEPTION 'A selected product is no longer available'; END IF;
    IF v_variant.stock < (v_item->>'quantity')::int THEN
      RAISE EXCEPTION 'Only % left of % (% / %)', v_variant.stock, v_product.name, v_variant.color, v_variant.size;
    END IF;

    v_price := coalesce(v_variant.price_override, v_product.price);
    v_subtotal := v_subtotal + v_price * (v_item->>'quantity')::int;
    v_mrp_total := v_mrp_total + v_product.mrp * (v_item->>'quantity')::int;

    SELECT url INTO v_image FROM public.product_images WHERE product_id = v_product.id ORDER BY is_primary DESC, position LIMIT 1;

    INSERT INTO public.order_items (order_id, product_id, variant_id, product_name, sku, size, color, image_url, unit_price, mrp, quantity, line_total)
    VALUES (v_order_id, v_product.id, v_variant.id, v_product.name, v_variant.sku, v_variant.size, v_variant.color, v_image,
            v_price, v_product.mrp, (v_item->>'quantity')::int, v_price * (v_item->>'quantity')::int);

    UPDATE public.product_variants SET stock = stock - (v_item->>'quantity')::int WHERE id = v_variant.id;
    UPDATE public.products SET sold_count = sold_count + (v_item->>'quantity')::int WHERE id = v_product.id;
    INSERT INTO public.inventory_transactions (variant_id, delta, reason, order_id)
    VALUES (v_variant.id, -(v_item->>'quantity')::int, 'Order ' || v_number, v_order_id);
  END LOOP;

  IF coalesce(payload->>'coupon_code','') <> '' THEN
    SELECT * INTO v_coupon FROM public.coupons WHERE upper(code) = upper(payload->>'coupon_code') AND is_active;
    IF FOUND
      AND (v_coupon.starts_at IS NULL OR v_coupon.starts_at <= now())
      AND (v_coupon.ends_at IS NULL OR v_coupon.ends_at >= now())
      AND v_subtotal >= v_coupon.min_order
      AND (v_coupon.usage_limit IS NULL OR v_coupon.used_count < v_coupon.usage_limit)
      AND (v_coupon.per_customer_limit IS NULL OR
           (SELECT count(*) FROM public.coupon_usage cu WHERE cu.coupon_id = v_coupon.id AND cu.user_id = v_user) < v_coupon.per_customer_limit)
    THEN
      IF v_coupon.discount_type = 'percent' THEN
        v_coupon_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
        IF v_coupon.max_discount IS NOT NULL THEN v_coupon_discount := least(v_coupon_discount, v_coupon.max_discount); END IF;
      ELSE
        v_coupon_discount := least(v_coupon.discount_value, v_subtotal);
      END IF;
      UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
      INSERT INTO public.coupon_usage (coupon_id, user_id, order_id) VALUES (v_coupon.id, v_user, v_order_id);
    ELSE
      v_coupon_discount := 0;
    END IF;
  END IF;

  v_delivery := coalesce((v_settings_del->>'delivery_fee')::numeric, 50);
  IF (v_subtotal - v_coupon_discount) >= coalesce((v_settings_del->>'free_delivery_threshold')::numeric, 999) THEN
    v_delivery := 0;
  END IF;
  IF v_method = 'cod' THEN v_cod := coalesce((v_settings_pay->>'cod_fee')::numeric, 99); END IF;

  v_total := round(v_subtotal - v_coupon_discount + v_delivery + v_cod, 2);

  UPDATE public.orders SET
    subtotal = v_subtotal,
    product_discount = greatest(v_mrp_total - v_subtotal, 0),
    coupon_code = CASE WHEN v_coupon_discount > 0 THEN upper(payload->>'coupon_code') ELSE NULL END,
    coupon_discount = v_coupon_discount,
    delivery_fee = v_delivery,
    cod_fee = v_cod,
    total = v_total,
    status = CASE WHEN v_method = 'cod' THEN 'confirmed' ELSE 'pending_payment' END,
    payment_status = CASE WHEN v_method = 'cod' THEN 'cod_pending' ELSE 'pending' END
  WHERE id = v_order_id;

  INSERT INTO public.order_status_history (order_id, status, note) VALUES (v_order_id, 'pending_payment', 'Order created');
  IF v_method = 'cod' THEN
    INSERT INTO public.order_status_history (order_id, status, note) VALUES (v_order_id, 'confirmed', 'Cash on Delivery order confirmed');
  END IF;

  INSERT INTO public.payments (order_id, provider, expected_amount, status)
  VALUES (v_order_id, CASE WHEN v_method = 'cod' THEN 'cod' ELSE 'razorpay' END, v_total,
          CASE WHEN v_method = 'cod' THEN 'cod_pending' ELSE 'created' END);

  DELETE FROM public.cart_items WHERE cart_id IN (SELECT id FROM public.carts WHERE user_id = v_user);

  RETURN jsonb_build_object('order_id', v_order_id, 'order_number', v_number, 'total', v_total);
END; $$;

REVOKE EXECUTE ON FUNCTION public.place_order(jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO authenticated;
