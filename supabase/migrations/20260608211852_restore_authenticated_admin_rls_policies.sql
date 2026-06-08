-- Restore authenticated admin RLS policies used by server actions that run
-- with the signed-in server client after checkAdminAuth().
--
-- Keep anon execution of current_user_is_admin revoked. Authenticated execution
-- is intentional because admin RLS policies need the helper.

GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO service_role;

DROP POLICY IF EXISTS "Allow users to read own profile" ON public.profiles;
CREATE POLICY "Allow users to read own profile or admins" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id OR (SELECT public.current_user_is_admin()));

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

CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING ((SELECT public.current_user_is_admin()));
CREATE POLICY "Allow systems or admins to write audit logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_is_admin()));

CREATE POLICY "Admins upload product images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    );

CREATE POLICY "Admins update product images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    )
    WITH CHECK (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    );

CREATE POLICY "Admins delete product images" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'product-images' AND (SELECT public.current_user_is_admin())
    );
