-- =====================================================================
-- AuctionSq seed data for a fresh Supabase project
-- =====================================================================

INSERT INTO public.categories (id, name, slug, description)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Telefona & Teknologji', 'teknologji', 'Smartphones, laptops, tablets, drones, and connected devices.'),
  ('10000000-0000-0000-0000-000000000002', 'Ore & Aksesore', 'ore-aksesore', 'Premium watches, jewelry, and accessories.'),
  ('10000000-0000-0000-0000-000000000003', 'Koleksione & Art', 'koleksione', 'Collectibles, vintage items, and art pieces.'),
  ('10000000-0000-0000-0000-000000000004', 'Vegla & Shtepia', 'vegla-shtepia', 'Home appliances, tools, and smart home items.'),
  ('10000000-0000-0000-0000-000000000005', 'Sport & Jashte', 'sport', 'Outdoor, fitness, and sport equipment.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (
  id,
  title,
  description,
  category_id,
  condition,
  images,
  testing_notes,
  status
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'iPhone 15 Pro Max - 256GB (E Kontrolluar)',
    'iPhone 15 Pro Max origjinal ne ngjyre Titanium Natyral. Produkti vjen me kutine origjinale dhe karikues. Nuk ka gervishtje dhe bateria eshte ne gjendje shume te mire.',
    '10000000-0000-0000-0000-000000000001',
    'like_new',
    ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80'],
    'Bateria: 98%. Kamera: e paster. FaceID: funksionon. Testuar nga stafi teknik.',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Ore Premium Tissot PRX Powermatic 80',
    'Tissot PRX automatike me fushe te kalter. Rrip celiku, xham safiri, rezistence ndaj ujit dhe kuti origjinale.',
    '10000000-0000-0000-0000-000000000002',
    'new',
    ARRAY['https://images.unsplash.com/photo-1622434641406-a158123450f9?w=900&auto=format&fit=crop&q=80'],
    'Produkt i ri, i paperdorur. Celiku pa shenja gervishtjeje.',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Dron DJI Mini 3 Pro me Kontrollues RC',
    'Dron kompakt profesional me xhirime 4K, kohe fluturimi deri ne 34 minuta dhe kontrollues me ekran te integruar.',
    '10000000-0000-0000-0000-000000000001',
    'used_good',
    ARRAY['https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=900&auto=format&fit=crop&q=80'],
    'Testuar fluturimi 20 minuta pa problem teknik. Helikat jane ne gjendje te mire.',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Kamera Retro Vintage Canon AE-1',
    'Kamera filmike klasike Canon AE-1 me lente 50mm f/1.8. E pershtatshme per koleksioniste dhe fotografi analoge.',
    '10000000-0000-0000-0000-000000000003',
    'used_fair',
    ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop&q=80'],
    'Mekanizmi i shkrepjes punon. Lentja nuk ka myk. Ka shenja normale perdorimi.',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.auctions (
  id,
  product_id,
  starting_price,
  current_price,
  min_increment,
  start_time,
  end_time,
  status
)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    80000,
    80000,
    2000,
    now() - interval '2 hours',
    now() + interval '3 hours',
    'active'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    45000,
    45000,
    1000,
    now() - interval '5 hours',
    now() + interval '24 hours',
    'active'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    60000,
    60000,
    1500,
    now() - interval '1 hour',
    now() + interval '45 minutes',
    'active'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000004',
    15000,
    15000,
    500,
    now() + interval '2 hours',
    now() + interval '2 days',
    'scheduled'
  )
ON CONFLICT (id) DO NOTHING;
