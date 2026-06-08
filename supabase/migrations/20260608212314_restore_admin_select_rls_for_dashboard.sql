-- Admin dashboard server components use the signed-in server client for some
-- reads, so authenticated admins need SELECT access in RLS. Keep these as
-- focused SELECT policies; service-role server actions still perform writes.

DROP POLICY IF EXISTS "Allow users to read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read own profile or admins" ON public.profiles;
CREATE POLICY "Allow users to read own profile or admins" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow users to read own bids" ON public.bids;
DROP POLICY IF EXISTS "Allow users to read own bids or admins" ON public.bids;
CREATE POLICY "Allow users to read own bids or admins" ON public.bids
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow users to see their own orders" ON public.orders;
CREATE POLICY "Allow users to see their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = winner_id OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow admin read products" ON public.products;
CREATE POLICY "Allow admin read products" ON public.products
    FOR SELECT TO authenticated
    USING ((SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow admin read auctions" ON public.auctions;
CREATE POLICY "Allow admin read auctions" ON public.auctions
    FOR SELECT TO authenticated
    USING ((SELECT public.current_user_is_admin()));
