-- Supabase advisor hardening pass.
--
-- Scope:
-- - Fix mutable search_path on trigger helper.
-- - Remove broad public storage object listing for the public product-images bucket.
-- - Revoke direct RPC execution on internal trigger/maintenance SECURITY DEFINER functions.
-- - Add covering indexes for foreign keys reported by the performance advisor.
-- - Optimize RLS auth helper calls with initplan-safe SELECT wrappers.
-- - Split admin write policies so authenticated SELECT does not evaluate duplicate permissive policies.

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

DO $$
BEGIN
    IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
        REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
        REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
        REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
    END IF;

    IF to_regprocedure('public.prevent_profile_role_self_mutation()') IS NOT NULL THEN
        REVOKE ALL ON FUNCTION public.prevent_profile_role_self_mutation() FROM PUBLIC;
        REVOKE ALL ON FUNCTION public.prevent_profile_role_self_mutation() FROM anon;
        REVOKE ALL ON FUNCTION public.prevent_profile_role_self_mutation() FROM authenticated;
    END IF;

    IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
        REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
        REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon;
        REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated;
    END IF;
END;
$$;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;

CREATE INDEX IF NOT EXISTS auctions_winner_id_idx ON public.auctions (winner_id);
CREATE INDEX IF NOT EXISTS auctions_winning_bid_id_idx ON public.auctions (winning_bid_id);
CREATE INDEX IF NOT EXISTS audit_logs_performed_by_idx ON public.audit_logs (performed_by);
CREATE INDEX IF NOT EXISTS bids_auction_id_idx ON public.bids (auction_id);
CREATE INDEX IF NOT EXISTS bids_user_id_idx ON public.bids (user_id);
CREATE INDEX IF NOT EXISTS orders_winner_id_idx ON public.orders (winner_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);

DROP POLICY IF EXISTS "Allow admin write access to categories" ON public.categories;
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

DROP POLICY IF EXISTS "Allow users to read own profile or admins" ON public.profiles;
CREATE POLICY "Allow users to read own profile or admins" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow admins full access to profiles" ON public.profiles;
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

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT TO public
    USING (status = 'active' OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow admin full access to products" ON public.products;
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

DROP POLICY IF EXISTS "Allow public read access to auctions" ON public.auctions;
CREATE POLICY "Allow public read access to auctions" ON public.auctions
    FOR SELECT TO public
    USING (status IN ('active', 'ended') OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow admin full access to auctions" ON public.auctions;
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

DROP POLICY IF EXISTS "Allow users to read own bids or admins" ON public.bids;
CREATE POLICY "Allow users to read own bids or admins" ON public.bids
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow admin to manage bids" ON public.bids;
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

DROP POLICY IF EXISTS "Allow users to see their own orders" ON public.orders;
CREATE POLICY "Allow users to see their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = winner_id OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow admins full access to orders" ON public.orders;
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

DROP POLICY IF EXISTS "Allow admins to read audit logs" ON public.audit_logs;
CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING ((SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow systems or admins to write audit logs" ON public.audit_logs;
CREATE POLICY "Allow systems or admins to write audit logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));
