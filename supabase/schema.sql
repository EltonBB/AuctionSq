-- =====================================================================
-- Ofertë - Ankande Online: Supabase Database Schema
-- =====================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. CATEGORIES TABLE
-- =====================================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 2. PROFILES TABLE (Extensions to Supabase auth.users)
-- =====================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone_number TEXT,
    country TEXT DEFAULT 'Albania',
    city TEXT,
    address TEXT,
    postal_code TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 3. PRODUCTS TABLE
-- =====================================================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'used_good', 'used_fair')),
    images TEXT[] NOT NULL DEFAULT '{}',
    testing_notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 4. AUCTIONS TABLE
-- =====================================================================
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    starting_price NUMERIC(12, 2) NOT NULL CHECK (starting_price >= 0),
    current_price NUMERIC(12, 2) NOT NULL CHECK (current_price >= starting_price),
    min_increment NUMERIC(12, 2) NOT NULL DEFAULT 1.00 CHECK (min_increment > 0),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL CHECK (end_time > start_time),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled', 'relisted')),
    auto_relist BOOLEAN NOT NULL DEFAULT false,
    winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    winning_bid_id UUID, -- Will be set when auction ends
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 5. BIDS TABLE
-- =====================================================================
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add reference in auctions to bids table (deferrable)
ALTER TABLE public.auctions ADD CONSTRAINT fk_winning_bid FOREIGN KEY (winning_bid_id) REFERENCES public.bids(id) ON DELETE SET NULL;

-- =====================================================================
-- 6. ORDERS TABLE
-- =====================================================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    winner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    final_price NUMERIC(12, 2) NOT NULL CHECK (final_price > 0),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Albania',
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_confirmation' 
      CHECK (status IN ('pending_confirmation', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 7. AUDIT LOGS TABLE
-- =====================================================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 8. AUTOMATIC TRIGGERS & PROCEDURES
-- =====================================================================

-- Trigger: Update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Automatically create public profile entry when a user registers
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() = OLD.id AND NOT public.current_user_is_admin() THEN
        IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
           OR NEW.is_blocked IS DISTINCT FROM OLD.is_blocked THEN
            RAISE EXCEPTION 'Profile role fields cannot be changed by the account owner.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER protect_profile_role_self_mutation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_self_mutation();

CREATE OR REPLACE FUNCTION public.update_own_profile(
    p_full_name TEXT,
    p_phone_number TEXT,
    p_country TEXT,
    p_city TEXT,
    p_address TEXT,
    p_postal_code TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
    v_profile public.profiles;
    v_country TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized. Please log in.';
    END IF;

    v_country := COALESCE(NULLIF(trim(p_country), ''), 'Albania');

    IF NULLIF(trim(p_full_name), '') IS NULL
       OR NULLIF(trim(p_phone_number), '') IS NULL
       OR NULLIF(trim(v_country), '') IS NULL
       OR NULLIF(trim(p_city), '') IS NULL
       OR NULLIF(trim(p_address), '') IS NULL THEN
        RAISE EXCEPTION 'All profile and delivery fields are required.';
    END IF;

    UPDATE public.profiles
    SET
        full_name = trim(p_full_name),
        phone_number = trim(p_phone_number),
        country = v_country,
        city = trim(p_city),
        address = trim(p_address),
        postal_code = NULLIF(trim(p_postal_code), ''),
        updated_at = now()
    WHERE id = auth.uid()
    RETURNING * INTO v_profile;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================================
-- 9. TRANSACTIONAL BIDDING FUNCTION (SAFE FROM RACE CONDITIONS)
-- =====================================================================
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

    -- 1. Lock the auction row for writing to prevent parallel transactions from double bidding
    SELECT status, start_time, end_time, starting_price, current_price, min_increment
    INTO v_auction_status, v_start_time, v_end_time, v_starting_price, v_current_price, v_min_increment
    FROM public.auctions
    WHERE id = p_auction_id
    FOR UPDATE;

    -- 2. Validate user profiles exists, is complete, and is not restricted/blocked
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

    -- 3. Validate auction timing & state
    -- If current time is after start_time and before end_time and status is 'scheduled', auto-activate it
    IF v_auction_status = 'scheduled' AND now() >= v_start_time AND now() < v_end_time THEN
        UPDATE public.auctions SET status = 'active' WHERE id = p_auction_id;
        v_auction_status := 'active';
    END IF;

    IF v_auction_status <> 'active' OR now() < v_start_time OR now() >= v_end_time THEN
        RAISE EXCEPTION 'Bidding is not allowed. The auction is currently %.', v_auction_status;
    END IF;

    -- 4. Validate bid amount
    -- If there are no active bids, the bid must be at least the starting_price.
    -- If there are active bids, the bid must be >= current_price + min_increment.
    DECLARE
        v_has_active_bids BOOLEAN;
    BEGIN
        SELECT EXISTS(
            SELECT 1 FROM public.bids 
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
    END;

    -- 5. Insert the new active bid
    INSERT INTO public.bids (auction_id, user_id, amount, status)
    VALUES (p_auction_id, v_request_user_id, p_bid_amount, 'active')
    RETURNING id INTO v_new_bid_id;

    -- 6. Update current auction price
    UPDATE public.auctions
    SET current_price = p_bid_amount,
        updated_at = now()
    WHERE id = p_auction_id;

    RETURN v_new_bid_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================================
-- 10. EXPIRED AUCTIONS CLOSER
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS orders_one_per_auction_idx
ON public.orders (auction_id);

CREATE UNIQUE INDEX IF NOT EXISTS auctions_one_live_per_product_idx
ON public.auctions (product_id)
WHERE status IN ('active', 'scheduled');

CREATE INDEX IF NOT EXISTS auctions_winner_id_idx ON public.auctions (winner_id);
CREATE INDEX IF NOT EXISTS auctions_winning_bid_id_idx ON public.auctions (winning_bid_id);
CREATE INDEX IF NOT EXISTS audit_logs_performed_by_idx ON public.audit_logs (performed_by);
CREATE INDEX IF NOT EXISTS bids_auction_id_idx ON public.bids (auction_id);
CREATE INDEX IF NOT EXISTS bids_user_id_idx ON public.bids (user_id);
CREATE INDEX IF NOT EXISTS orders_winner_id_idx ON public.orders (winner_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);

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

CREATE OR REPLACE FUNCTION public.confirm_order_delivery(
    p_order_id UUID,
    p_full_name TEXT,
    p_phone_number TEXT,
    p_country TEXT,
    p_city TEXT,
    p_address TEXT
)
RETURNS public.orders AS $$
DECLARE
    v_order public.orders;
    v_country TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Ju lutemi identifikohuni.';
    END IF;

    v_country := COALESCE(NULLIF(trim(p_country), ''), 'Albania');

    IF NULLIF(trim(p_full_name), '') IS NULL
       OR NULLIF(trim(p_phone_number), '') IS NULL
       OR NULLIF(trim(v_country), '') IS NULL
       OR NULLIF(trim(p_city), '') IS NULL
       OR NULLIF(trim(p_address), '') IS NULL THEN
        RAISE EXCEPTION 'Te gjitha fushat e adreses jane te detyrueshme.';
    END IF;

    SELECT *
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Porosia nuk u gjet.';
    END IF;

    IF v_order.winner_id <> auth.uid() THEN
        RAISE EXCEPTION 'Nuk jeni i autorizuar.';
    END IF;

    IF v_order.status NOT IN ('pending_confirmation', 'confirmed') THEN
        RAISE EXCEPTION 'Nuk mund te ndryshohet adresa ne kete faze.';
    END IF;

    UPDATE public.orders
    SET
        full_name = trim(p_full_name),
        phone_number = trim(p_phone_number),
        country = v_country,
        city = trim(p_city),
        address = trim(p_address),
        status = CASE WHEN status = 'pending_confirmation' THEN 'confirmed' ELSE status END,
        updated_at = now()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

    RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================================
-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Category Policies
CREATE POLICY "Allow public read-only access to categories" ON public.categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin insert categories" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin update categories" ON public.categories
    FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_is_admin()))
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin delete categories" ON public.categories
    FOR DELETE TO authenticated
    USING ((SELECT public.current_user_is_admin()));

-- Profile Policies
CREATE POLICY "Allow users to read own profile or admins" ON public.profiles
    FOR SELECT TO authenticated USING (
        (SELECT auth.uid()) = id OR (SELECT public.current_user_is_admin())
    );

CREATE POLICY "Allow admins insert profiles" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admins update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_is_admin()))
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admins delete profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING ((SELECT public.current_user_is_admin()));

-- Product Policies
CREATE POLICY "Allow anon read active products" ON public.products
    FOR SELECT TO anon
    USING (status = 'active');

CREATE POLICY "Allow authenticated read products" ON public.products
    FOR SELECT TO authenticated
    USING (status = 'active' OR (SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin insert products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin update products" ON public.products
    FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_is_admin()))
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin delete products" ON public.products
    FOR DELETE TO authenticated
    USING ((SELECT public.current_user_is_admin()));

-- Auction Policies
CREATE POLICY "Allow public read access to auctions" ON public.auctions
    FOR SELECT TO anon
    USING (status IN ('active', 'ended'));

CREATE POLICY "Allow authenticated read auctions" ON public.auctions
    FOR SELECT TO authenticated
    USING (status IN ('active', 'ended') OR (SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin insert auctions" ON public.auctions
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin update auctions" ON public.auctions
    FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_is_admin()))
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin delete auctions" ON public.auctions
    FOR DELETE TO authenticated
    USING ((SELECT public.current_user_is_admin()));

-- Bid Policies
CREATE POLICY "Allow users to read own bids or admins" ON public.bids
    FOR SELECT TO authenticated USING (
        (SELECT auth.uid()) = user_id OR (SELECT public.current_user_is_admin())
    );

CREATE POLICY "Allow admin insert bids" ON public.bids
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin update bids" ON public.bids
    FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_is_admin()))
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admin delete bids" ON public.bids
    FOR DELETE TO authenticated
    USING ((SELECT public.current_user_is_admin()));

-- Order Policies
CREATE POLICY "Allow users to see their own orders" ON public.orders
    FOR SELECT TO authenticated USING (
        (SELECT auth.uid()) = winner_id OR (SELECT public.current_user_is_admin())
    );

CREATE POLICY "Allow admins insert orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admins update orders" ON public.orders
    FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_is_admin()))
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow admins delete orders" ON public.orders
    FOR DELETE TO authenticated
    USING ((SELECT public.current_user_is_admin()));

-- Audit Log Policies
CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING ((SELECT public.current_user_is_admin()));

CREATE POLICY "Allow systems or admins to write audit logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

-- =====================================================================
-- 12. RPC GRANTS AND STORAGE POLICIES
-- =====================================================================

REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM anon;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.place_bid(UUID, NUMERIC) TO authenticated;

REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM anon;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

REVOKE ALL ON FUNCTION public.prevent_profile_role_self_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_profile_role_self_mutation() FROM anon;
REVOKE ALL ON FUNCTION public.prevent_profile_role_self_mutation() FROM authenticated;

REVOKE ALL ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM anon;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.close_expired_auctions() TO service_role;

REVOKE ALL ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

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

DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
CREATE POLICY "Admins upload product images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    );

DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
CREATE POLICY "Admins update product images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    )
    WITH CHECK (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    );

DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;
CREATE POLICY "Admins delete product images" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    );
