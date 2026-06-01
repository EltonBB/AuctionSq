-- Security and lifecycle hardening after production review.
-- - Never trust user-controlled metadata for admin role assignment.
-- - Enforce admin bidding block inside the RPC, not only in app code.
-- - Restrict raw bid reads to bid owner/admin; public pages must use server-side reads.
-- - Keep expired-auction finalization idempotent and service-role only.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
    v_is_admin BOOLEAN;
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

    SELECT is_blocked, is_admin, full_name, phone_number, city, address
    INTO v_is_blocked, v_is_admin, v_full_name, v_phone_number, v_city, v_address
    FROM public.profiles
    WHERE id = v_request_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    IF v_is_admin THEN
        RAISE EXCEPTION 'ti je admini nuk mund te ofrosh';
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
    SET current_price = p_bid_amount,
        updated_at = now()
    WHERE id = p_auction_id;

    RETURN v_new_bid_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Allow public read access to bids" ON public.bids;
DROP POLICY IF EXISTS "Allow users to read own bids or admins" ON public.bids;
CREATE POLICY "Allow users to read own bids or admins" ON public.bids
    FOR SELECT TO authenticated USING (
        auth.uid() = user_id OR public.current_user_is_admin()
    );

CREATE UNIQUE INDEX IF NOT EXISTS orders_one_per_auction_idx
ON public.orders (auction_id);

CREATE OR REPLACE FUNCTION public.close_expired_auctions()
RETURNS TABLE (
    auction_id UUID,
    winner_id UUID,
    final_price NUMERIC(12, 2),
    order_id UUID
) AS $$
DECLARE
    r RECORD;
    v_highest_bid_id UUID;
    v_highest_bid_user_id UUID;
    v_highest_bid_amount NUMERIC(12, 2);
    v_full_name TEXT;
    v_phone_number TEXT;
    v_country TEXT;
    v_city TEXT;
    v_address TEXT;
    v_new_order_id UUID;
BEGIN
    FOR r IN
        SELECT a.id, a.starting_price
        FROM public.auctions a
        WHERE a.status IN ('active', 'scheduled')
          AND now() >= a.end_time
        FOR UPDATE SKIP LOCKED
    LOOP
        SELECT b.id, b.user_id, b.amount
        INTO v_highest_bid_id, v_highest_bid_user_id, v_highest_bid_amount
        FROM public.bids b
        WHERE b.auction_id = r.id AND b.status = 'active'
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1;

        IF FOUND THEN
            SELECT p.full_name, p.phone_number, p.country, p.city, p.address
            INTO v_full_name, v_phone_number, v_country, v_city, v_address
            FROM public.profiles p
            WHERE p.id = v_highest_bid_user_id;

            UPDATE public.auctions
            SET status = 'ended',
                winner_id = v_highest_bid_user_id,
                winning_bid_id = v_highest_bid_id,
                current_price = v_highest_bid_amount,
                updated_at = now()
            WHERE id = r.id;

            INSERT INTO public.orders (
                auction_id, winner_id, final_price,
                full_name, phone_number, country, city, address,
                status
            )
            SELECT
                r.id, v_highest_bid_user_id, v_highest_bid_amount,
                COALESCE(v_full_name, 'Winner Account'),
                COALESCE(v_phone_number, 'N/A'),
                COALESCE(v_country, 'Albania'),
                COALESCE(v_city, 'Tirana'),
                COALESCE(v_address, 'Pending confirmation'),
                'pending_confirmation'
            WHERE NOT EXISTS (
                SELECT 1
                FROM public.orders o
                WHERE o.auction_id = r.id
            )
            RETURNING id INTO v_new_order_id;

            IF v_new_order_id IS NULL THEN
                SELECT o.id INTO v_new_order_id
                FROM public.orders o
                WHERE o.auction_id = r.id;
            END IF;

            auction_id := r.id;
            winner_id := v_highest_bid_user_id;
            final_price := v_highest_bid_amount;
            order_id := v_new_order_id;
            RETURN NEXT;
        ELSE
            UPDATE public.auctions
            SET status = 'ended',
                winner_id = NULL,
                winning_bid_id = NULL,
                current_price = starting_price,
                updated_at = now()
            WHERE id = r.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM anon;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.place_bid(UUID, NUMERIC) TO authenticated;

REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM anon;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.close_expired_auctions() TO service_role;
