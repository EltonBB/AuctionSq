-- High-priority auction integrity hardening:
-- - prevent duplicate active/scheduled auctions for the same product
-- - avoid exposing cancelled, scheduled, or relisted auctions through public reads

CREATE UNIQUE INDEX IF NOT EXISTS auctions_one_live_per_product_idx
ON public.auctions (product_id)
WHERE status IN ('active', 'scheduled');

DROP POLICY IF EXISTS "Allow public read access to auctions" ON public.auctions;
CREATE POLICY "Allow public read access to auctions" ON public.auctions
    FOR SELECT TO public USING (
        status IN ('active', 'ended') OR public.current_user_is_admin()
    );
