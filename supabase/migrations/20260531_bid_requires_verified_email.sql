-- Require verified email before allowing bids.

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
  v_email_confirmed_at TIMESTAMPTZ;
BEGIN
  v_request_user_id := auth.uid();
  IF v_request_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to place a bid.';
  END IF;

  SELECT email_confirmed_at
    INTO v_email_confirmed_at
  FROM auth.users
  WHERE id = v_request_user_id;

  IF v_email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Please verify your email address before placing bids.';
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
