CREATE TABLE IF NOT EXISTS public.app_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  limit_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT app_rate_limits_unique_window UNIQUE (action, limit_key, window_start),
  CONSTRAINT app_rate_limits_positive_count CHECK (attempt_count >= 0)
);

ALTER TABLE public.app_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.app_rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.app_rate_limits_id_seq FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_rate_limits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.app_rate_limits_id_seq TO service_role;

CREATE INDEX IF NOT EXISTS app_rate_limits_cleanup_idx
  ON public.app_rate_limits (window_start);

CREATE OR REPLACE FUNCTION public.check_app_rate_limit(
  p_action TEXT,
  p_limit_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  attempt_count INTEGER,
  remaining INTEGER,
  reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  IF p_action IS NULL OR length(trim(p_action)) = 0 THEN
    RAISE EXCEPTION 'rate limit action is required';
  END IF;

  IF p_limit_key IS NULL OR length(trim(p_limit_key)) = 0 THEN
    RAISE EXCEPTION 'rate limit key is required';
  END IF;

  IF p_limit < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'rate limit and window must be positive';
  END IF;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.app_rate_limits (
    action,
    limit_key,
    window_start,
    attempt_count,
    first_seen_at,
    updated_at
  )
  VALUES (
    p_action,
    p_limit_key,
    v_window_start,
    1,
    v_now,
    v_now
  )
  ON CONFLICT (action, limit_key, window_start)
  DO UPDATE SET
    attempt_count = public.app_rate_limits.attempt_count + 1,
    updated_at = v_now
  RETURNING public.app_rate_limits.attempt_count INTO v_count;

  DELETE FROM public.app_rate_limits
  WHERE window_start < v_now - interval '2 days';

  RETURN QUERY SELECT
    v_count <= p_limit,
    v_count,
    greatest(p_limit - v_count, 0),
    v_window_start + (p_window_seconds || ' seconds')::interval;
END;
$$;

REVOKE ALL ON FUNCTION public.check_app_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_app_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
