-- Add per-auction automatic relisting for unsold/no-bid auctions.
-- When enabled, expired auctions with no active bids are marked as relisted and
-- a fresh 24h auction is created for the same product at the same start price.

ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS auto_relist BOOLEAN NOT NULL DEFAULT false;

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
    v_new_auction_id UUID;
BEGIN
    FOR r IN
        SELECT a.id, a.product_id, a.starting_price, a.min_increment, a.auto_relist
        FROM public.auctions a
        WHERE a.status IN ('active', 'scheduled')
          AND now() >= a.end_time
        FOR UPDATE SKIP LOCKED
    LOOP
        v_new_order_id := NULL;
        v_new_auction_id := NULL;

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
            IF r.auto_relist THEN
                UPDATE public.auctions
                SET status = 'relisted',
                    winner_id = NULL,
                    winning_bid_id = NULL,
                    current_price = starting_price,
                    updated_at = now()
                WHERE id = r.id;

                INSERT INTO public.auctions (
                    product_id,
                    starting_price,
                    current_price,
                    min_increment,
                    start_time,
                    end_time,
                    status,
                    auto_relist
                )
                VALUES (
                    r.product_id,
                    r.starting_price,
                    r.starting_price,
                    r.min_increment,
                    now(),
                    now() + interval '24 hours',
                    'active',
                    true
                )
                RETURNING id INTO v_new_auction_id;
            ELSE
                UPDATE public.auctions
                SET status = 'ended',
                    winner_id = NULL,
                    winning_bid_id = NULL,
                    current_price = starting_price,
                    updated_at = now()
                WHERE id = r.id;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;
