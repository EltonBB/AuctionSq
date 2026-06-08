-- Avoid duplicate permissive SELECT policies for authenticated users while
-- preserving public reads for visitors and admin reads for dashboard pages.

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow admin read products" ON public.products;
CREATE POLICY "Allow anon read active products" ON public.products
    FOR SELECT TO anon
    USING (status = 'active');
CREATE POLICY "Allow authenticated read products" ON public.products
    FOR SELECT TO authenticated
    USING (status = 'active' OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Allow public read access to auctions" ON public.auctions;
DROP POLICY IF EXISTS "Allow admin read auctions" ON public.auctions;
CREATE POLICY "Allow anon read visible auctions" ON public.auctions
    FOR SELECT TO anon
    USING (status IN ('active', 'ended'));
CREATE POLICY "Allow authenticated read auctions" ON public.auctions
    FOR SELECT TO authenticated
    USING (status IN ('active', 'ended') OR (SELECT public.current_user_is_admin()));

DROP POLICY IF EXISTS "Deny direct audit log access" ON public.audit_logs;
