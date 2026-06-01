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
$$ language 'plpgsql';

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

CREATE POLICY "Allow admin write access to categories" ON public.categories
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

-- Profile Policies
CREATE POLICY "Allow users to read own profile or admins" ON public.profiles
    FOR SELECT TO authenticated USING (
        auth.uid() = id OR public.current_user_is_admin()
    );

CREATE POLICY "Allow users to update their own profiles" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins full access to profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

-- Product Policies
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT TO public USING (status = 'active' OR public.current_user_is_admin());

CREATE POLICY "Allow admin full access to products" ON public.products
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

-- Auction Policies
CREATE POLICY "Allow public read access to auctions" ON public.auctions
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to auctions" ON public.auctions
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

-- Bid Policies
CREATE POLICY "Allow users to read own bids or admins" ON public.bids
    FOR SELECT TO authenticated USING (
        auth.uid() = user_id OR public.current_user_is_admin()
    );

CREATE POLICY "Allow authenticated users to place bids" ON public.bids
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_blocked = false
        )
    );

CREATE POLICY "Allow admin to manage bids" ON public.bids
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

-- Order Policies
CREATE POLICY "Allow users to see their own orders" ON public.orders
    FOR SELECT TO authenticated USING (
        auth.uid() = winner_id OR public.current_user_is_admin()
    );

CREATE POLICY "Allow users to confirm their own order delivery details" ON public.orders
    FOR UPDATE TO authenticated USING (
        auth.uid() = winner_id AND status = 'pending_confirmation'
    ) WITH CHECK (
        auth.uid() = winner_id AND status IN ('pending_confirmation', 'confirmed')
    );

CREATE POLICY "Allow admins full access to orders" ON public.orders
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

-- Audit Log Policies
CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.current_user_is_admin());

CREATE POLICY "Allow systems or admins to write audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (public.current_user_is_admin());

-- =====================================================================
-- 12. RPC GRANTS AND STORAGE POLICIES
-- =====================================================================

REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM anon;
REVOKE ALL ON FUNCTION public.place_bid(UUID, NUMERIC) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.place_bid(UUID, NUMERIC) TO authenticated;

REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO service_role;

REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM anon;
REVOKE ALL ON FUNCTION public.close_expired_auctions() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.close_expired_auctions() TO service_role;

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
        bucket_id = 'product-images' AND public.current_user_is_admin()
    );

DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
CREATE POLICY "Admins update product images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'product-images' AND public.current_user_is_admin()
    )
    WITH CHECK (
        bucket_id = 'product-images' AND public.current_user_is_admin()
    );

DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;
CREATE POLICY "Admins delete product images" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'product-images' AND public.current_user_is_admin()
    );
