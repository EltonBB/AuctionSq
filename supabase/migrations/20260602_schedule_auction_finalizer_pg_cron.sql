-- Run expired auction finalization inside Supabase so Vercel Hobby cron limits
-- do not affect auction/order lifecycle.

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'auction-finalizer-every-minute'
  ) THEN
    PERFORM cron.unschedule('auction-finalizer-every-minute');
  END IF;
END;
$$;

SELECT cron.schedule(
  'auction-finalizer-every-minute',
  '* * * * *',
  'SELECT public.close_expired_auctions();'
);
