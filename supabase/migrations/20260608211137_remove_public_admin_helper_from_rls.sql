-- Remove direct client dependence on public.current_user_is_admin().
--
-- Admin application actions are authorized in server actions and then executed
-- with the Supabase service role client. RLS for anon/authenticated clients only
-- needs public reads and user-owned reads. This lets us revoke direct execution
-- of the SECURITY DEFINER admin helper from anon/authenticated roles.

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT TO public
    USING (status = 'active');

DROP POLICY IF EXISTS "Allow public read access to auctions" ON public.auctions;
CREATE POLICY "Allow public read access to auctions" ON public.auctions
    FOR SELECT TO public
    USING (status IN ('active', 'ended'));

DROP POLICY IF EXISTS "Allow users to read own profile or admins" ON public.profiles;
CREATE POLICY "Allow users to read own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Allow users to read own bids or admins" ON public.bids;
CREATE POLICY "Allow users to read own bids" ON public.bids
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to see their own orders" ON public.orders;
CREATE POLICY "Allow users to see their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = winner_id);

DROP POLICY IF EXISTS "Allow admin insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin delete categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admins insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin insert products" ON public.products;
DROP POLICY IF EXISTS "Allow admin update products" ON public.products;
DROP POLICY IF EXISTS "Allow admin delete products" ON public.products;
DROP POLICY IF EXISTS "Allow admin insert auctions" ON public.auctions;
DROP POLICY IF EXISTS "Allow admin update auctions" ON public.auctions;
DROP POLICY IF EXISTS "Allow admin delete auctions" ON public.auctions;
DROP POLICY IF EXISTS "Allow admin insert bids" ON public.bids;
DROP POLICY IF EXISTS "Allow admin update bids" ON public.bids;
DROP POLICY IF EXISTS "Allow admin delete bids" ON public.bids;
DROP POLICY IF EXISTS "Allow admins insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins delete orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow systems or admins to write audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;

REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM anon;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO service_role;
