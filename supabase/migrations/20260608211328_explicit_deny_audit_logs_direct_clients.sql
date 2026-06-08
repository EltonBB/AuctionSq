-- Keep audit logs closed to direct anon/authenticated clients while avoiding
-- the "RLS enabled with no policies" advisor noise. Server-side admin reads and
-- writes use the service role client, which bypasses RLS.

DROP POLICY IF EXISTS "Deny direct audit log access" ON public.audit_logs;
CREATE POLICY "Deny direct audit log access" ON public.audit_logs
    FOR ALL TO public
    USING (false)
    WITH CHECK (false);
