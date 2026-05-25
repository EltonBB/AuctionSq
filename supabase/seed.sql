-- =====================================================================
-- AuctionSq seed data for a fresh Supabase project
-- =====================================================================

INSERT INTO public.categories (id, name, slug, description)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Teknologji', 'teknologji', 'Telefona, laptopa, tablete, drone dhe pajisje smart.'),
  ('10000000-0000-0000-0000-000000000002', 'Gaming', 'gaming', 'Konsola, aksesore gaming, monitor dhe pajisje streaming.'),
  ('10000000-0000-0000-0000-000000000003', 'Pajisje Shtepiake', 'pajisje-shtepiake', 'Pajisje per shtepine, pastrim, ngrohje dhe smart home.'),
  ('10000000-0000-0000-0000-000000000004', 'Vegla Pune', 'vegla-pune', 'Vegla elektrike, instrumente pune dhe sete profesionale.'),
  ('10000000-0000-0000-0000-000000000005', 'Kuzhine', 'kuzhine', 'Pajisje kuzhine, espresso, blendera dhe aksesore gatimi.'),
  ('10000000-0000-0000-0000-000000000006', 'Kozmetike & Pajisje', 'kozmetike-pajisje', 'Pajisje bukurie, kujdes personal dhe sete profesionale.'),
  ('10000000-0000-0000-0000-000000000007', 'Sport & Fitness', 'sport-fitness', 'Pajisje fitness, sport dhe aktivitete ne natyre.'),
  ('10000000-0000-0000-0000-000000000008', 'Per Femije', 'per-femije', 'Produkte te kontrolluara per femije dhe familje.'),
  ('10000000-0000-0000-0000-000000000009', 'Te Ndryshme', 'te-ndryshme', 'Produkte te vecanta qe nuk futen ne kategorite e tjera.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description;

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
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'PlayStation 5 Slim me 2 Kontrollera',
    'Konsola eshte testuar me lojera fizike dhe digjitale. Perfshin dy kontrollera DualSense dhe kabllo origjinale.',
    '10000000-0000-0000-0000-000000000002',
    'like_new',
    ARRAY['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=900&auto=format&fit=crop&q=80'],
    'Portat, Wi-Fi, lexuesi i diskut dhe kontrollera funksionojne pa probleme.',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'Dyson V11 Absolute Cordless',
    'Fshese elektrike pa kabllo me aksesore origjinale per dysheme, tapiceri dhe cepa.',
    '10000000-0000-0000-0000-000000000003',
    'used_good',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=80'],
    'Bateria mban mire, filtri eshte pastruar dhe motori punon normalisht.',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'Makita Percussion Drill Set 18V',
    'Set pune me valixhe, dy bateri, karikues dhe aksesore per montime shtepie ose pune profesionale.',
    '10000000-0000-0000-0000-000000000004',
    'used_good',
    ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&auto=format&fit=crop&q=80'],
    'Testuar ne dru dhe metal. Baterite karikohen normalisht.',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'DeLonghi Magnifica S Espresso',
    'Makine kafeje automatike per espresso dhe cappuccino, e pastruar dhe testuar.',
    '10000000-0000-0000-0000-000000000005',
    'used_good',
    ARRAY['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=900&auto=format&fit=crop&q=80'],
    'Mulli, pompe, avull dhe cikli i pastrimit punojne rregullisht.',
    'active'
  ),
  (
    '20000000-0000-0000-0000-000000000009',
    'Garmin Forerunner 255 Music',
    'Ore sportive GPS per vrap, palester dhe monitorim shendeti me muzike offline.',
    '10000000-0000-0000-0000-000000000007',
    'like_new',
    ARRAY['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=900&auto=format&fit=crop&q=80'],
    'Sensor optik, GPS dhe sinkronizimi Bluetooth u testuan me sukses.',
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
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000005',
    43000,
    45500,
    1000,
    now() - interval '4 hours',
    now() + interval '7 hours',
    'active'
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000006',
    18000,
    19500,
    500,
    now() - interval '6 hours',
    now() + interval '18 hours',
    'active'
  ),
  (
    '30000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000007',
    12000,
    12000,
    500,
    now() + interval '1 day',
    now() + interval '3 days',
    'scheduled'
  ),
  (
    '30000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000008',
    22000,
    24500,
    1000,
    now() - interval '8 hours',
    now() + interval '90 minutes',
    'active'
  ),
  (
    '30000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000009',
    14000,
    16000,
    500,
    now() - interval '12 hours',
    now() - interval '2 hours',
    'ended'
  )
ON CONFLICT (id) DO NOTHING;
