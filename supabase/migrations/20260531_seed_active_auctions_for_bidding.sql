-- Ensure there are active auctions with future end times for bid testing.

WITH target_auctions AS (
  SELECT id
  FROM public.auctions
  ORDER BY created_at ASC
  LIMIT 4
)
UPDATE public.auctions
SET
  start_time = now() - interval '2 hours',
  end_time = now() + interval '36 hours',
  status = 'active',
  winner_id = NULL,
  winning_bid_id = NULL,
  updated_at = now()
WHERE id IN (SELECT id FROM target_auctions);

UPDATE public.bids
SET
  status = 'cancelled',
  cancelled_reason = COALESCE(cancelled_reason, 'Reset for test active auctions')
WHERE auction_id IN (
  SELECT id
  FROM public.auctions
  ORDER BY created_at ASC
  LIMIT 4
)
AND status = 'active';

UPDATE public.auctions a
SET current_price = a.starting_price
WHERE a.id IN (
  SELECT id
  FROM public.auctions
  ORDER BY created_at ASC
  LIMIT 4
);
