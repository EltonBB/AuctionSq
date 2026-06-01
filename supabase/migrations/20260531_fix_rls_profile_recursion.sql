-- Fix recursive RLS checks caused by policies querying public.profiles
-- from inside policies on public.profiles and related tables.

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO service_role;

DROP POLICY IF EXISTS "Allow admin write access to categories" ON public.categories;
CREATE POLICY "Allow admin write access to categories" ON public.categories
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Allow users to read own profile or admins" ON public.profiles;
CREATE POLICY "Allow users to read own profile or admins" ON public.profiles
    FOR SELECT TO authenticated USING (
        auth.uid() = id OR public.current_user_is_admin()
    );

DROP POLICY IF EXISTS "Allow admins full access to profiles" ON public.profiles;
CREATE POLICY "Allow admins full access to profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT TO public USING (
        status = 'active' OR public.current_user_is_admin()
    );

DROP POLICY IF EXISTS "Allow admin full access to products" ON public.products;
CREATE POLICY "Allow admin full access to products" ON public.products
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Allow admin full access to auctions" ON public.auctions;
CREATE POLICY "Allow admin full access to auctions" ON public.auctions
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Allow authenticated users to place bids" ON public.bids;
CREATE POLICY "Allow authenticated users to place bids" ON public.bids
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = user_id AND EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
              AND is_blocked = false
        )
    );

DROP POLICY IF EXISTS "Allow admin to manage bids" ON public.bids;
CREATE POLICY "Allow admin to manage bids" ON public.bids
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Allow users to see their own orders" ON public.orders;
CREATE POLICY "Allow users to see their own orders" ON public.orders
    FOR SELECT TO authenticated USING (
        auth.uid() = winner_id OR public.current_user_is_admin()
    );

DROP POLICY IF EXISTS "Allow admins full access to orders" ON public.orders;
CREATE POLICY "Allow admins full access to orders" ON public.orders
    FOR ALL TO authenticated USING (public.current_user_is_admin())
    WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Allow admins to read audit logs" ON public.audit_logs;
CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Allow systems or admins to write audit logs" ON public.audit_logs;
CREATE POLICY "Allow systems or admins to write audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (public.current_user_is_admin());

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
