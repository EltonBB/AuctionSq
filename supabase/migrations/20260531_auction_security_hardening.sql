-- AuctionSq production hardening migration
-- - remove bid identity spoofing in RPC
-- - tighten profile read policy
-- - lock down function execute grants
-- - provision storage bucket/policies for product images

DROP FUNCTION IF EXISTS public.place_bid(UUID, UUID, NUMERIC);

CREATE OR REPLACE FUNCTION public.place_bid(
  p_auction_id UUID,
  p_bid_amount NUMERIC(12, 2)
)
RETURNS UUID AS $$
DECLARE
  v_request_user_id UUID;
  v_auction_status TEXT;
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_starting_price NUMERIC(12, 2);
  v_current_price NUMERIC(12, 2);
  v_min_increment NUMERIC(12, 2);
  v_is_blocked BOOLEAN;
  v_full_name TEXT;
  v_phone_number TEXT;
  v_city TEXT;
  v_address TEXT;
  v_new_bid_id UUID;
  v_has_active_bids BOOLEAN;
BEGIN
  v_request_user_id := auth.uid();
  IF v_request_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to place a bid.';
  END IF;

  SELECT status, start_time, end_time, starting_price, current_price, min_increment
    INTO v_auction_status, v_start_time, v_end_time, v_starting_price, v_current_price, v_min_increment
  FROM public.auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auction not found.';
  END IF;

  SELECT is_blocked, full_name, phone_number, city, address
    INTO v_is_blocked, v_full_name, v_phone_number, v_city, v_address
  FROM public.profiles
  WHERE id = v_request_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found.';
  END IF;

  IF v_is_blocked THEN
    RAISE EXCEPTION 'This account has been restricted from bidding.';
  END IF;

  IF v_full_name IS NULL OR v_full_name = '' OR
     v_phone_number IS NULL OR v_phone_number = '' OR
     v_city IS NULL OR v_city = '' OR
     v_address IS NULL OR v_address = '' THEN
    RAISE EXCEPTION 'Please complete your profile and delivery address details before bidding.';
  END IF;

  IF v_auction_status = 'scheduled' AND now() >= v_start_time AND now() < v_end_time THEN
    UPDATE public.auctions SET status = 'active' WHERE id = p_auction_id;
    v_auction_status := 'active';
  END IF;

  IF v_auction_status <> 'active' OR now() < v_start_time OR now() >= v_end_time THEN
    RAISE EXCEPTION 'Bidding is not allowed. The auction is currently %.', v_auction_status;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM public.bids
    WHERE auction_id = p_auction_id AND status = 'active'
  ) INTO v_has_active_bids;

  IF NOT v_has_active_bids THEN
    IF p_bid_amount < v_starting_price THEN
      RAISE EXCEPTION 'First bid must be at least the starting price of Leka %.', v_starting_price;
    END IF;
  ELSE
    IF p_bid_amount < (v_current_price + v_min_increment) THEN
      RAISE EXCEPTION 'Bid must be at least Leka %, which satisfies the minimum bid increment.', (v_current_price + v_min_increment);
    END IF;
  END IF;

  INSERT INTO public.bids (auction_id, user_id, amount, status)
  VALUES (p_auction_id, v_request_user_id, p_bid_amount, 'active')
  RETURNING id INTO v_new_bid_id;

  UPDATE public.auctions
  SET current_price = p_bid_amount, updated_at = now()
  WHERE id = p_auction_id;

  RETURN v_new_bid_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM anon;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.place_bid(UUID, NUMERIC) TO authenticated;

REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM anon;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.close_expired_auctions() TO service_role;

DROP POLICY IF EXISTS "Allow public read access to active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read own profile or admins" ON public.profiles;
CREATE POLICY "Allow users to read own profile or admins" ON public.profiles
  FOR SELECT TO authenticated USING (
    auth.uid() = id OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
CREATE POLICY "Admins upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
CREATE POLICY "Admins update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;
CREATE POLICY "Admins delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );
