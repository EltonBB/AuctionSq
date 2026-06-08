-- Must-fix RLS hardening:
-- - profile self-service updates must not be able to mutate role/block fields
-- - bids must only be created through public.place_bid
-- - winner order confirmation must only update delivery fields through a narrow RPC

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() = OLD.id AND NOT public.current_user_is_admin() THEN
        IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
           OR NEW.is_blocked IS DISTINCT FROM OLD.is_blocked THEN
            RAISE EXCEPTION 'Profile role fields cannot be changed by the account owner.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_profile_role_self_mutation ON public.profiles;
CREATE TRIGGER protect_profile_role_self_mutation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_self_mutation();

CREATE OR REPLACE FUNCTION public.update_own_profile(
    p_full_name TEXT,
    p_phone_number TEXT,
    p_country TEXT,
    p_city TEXT,
    p_address TEXT,
    p_postal_code TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
    v_profile public.profiles;
    v_country TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized. Please log in.';
    END IF;

    v_country := COALESCE(NULLIF(trim(p_country), ''), 'Albania');

    IF NULLIF(trim(p_full_name), '') IS NULL
       OR NULLIF(trim(p_phone_number), '') IS NULL
       OR NULLIF(trim(v_country), '') IS NULL
       OR NULLIF(trim(p_city), '') IS NULL
       OR NULLIF(trim(p_address), '') IS NULL THEN
        RAISE EXCEPTION 'All profile and delivery fields are required.';
    END IF;

    UPDATE public.profiles
    SET
        full_name = trim(p_full_name),
        phone_number = trim(p_phone_number),
        country = v_country,
        city = trim(p_city),
        address = trim(p_address),
        postal_code = NULLIF(trim(p_postal_code), ''),
        updated_at = now()
    WHERE id = auth.uid()
    RETURNING * INTO v_profile;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.confirm_order_delivery(
    p_order_id UUID,
    p_full_name TEXT,
    p_phone_number TEXT,
    p_country TEXT,
    p_city TEXT,
    p_address TEXT
)
RETURNS public.orders AS $$
DECLARE
    v_order public.orders;
    v_country TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Ju lutemi identifikohuni.';
    END IF;

    v_country := COALESCE(NULLIF(trim(p_country), ''), 'Albania');

    IF NULLIF(trim(p_full_name), '') IS NULL
       OR NULLIF(trim(p_phone_number), '') IS NULL
       OR NULLIF(trim(v_country), '') IS NULL
       OR NULLIF(trim(p_city), '') IS NULL
       OR NULLIF(trim(p_address), '') IS NULL THEN
        RAISE EXCEPTION 'Te gjitha fushat e adreses jane te detyrueshme.';
    END IF;

    SELECT *
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Porosia nuk u gjet.';
    END IF;

    IF v_order.winner_id <> auth.uid() THEN
        RAISE EXCEPTION 'Nuk jeni i autorizuar.';
    END IF;

    IF v_order.status NOT IN ('pending_confirmation', 'confirmed') THEN
        RAISE EXCEPTION 'Nuk mund te ndryshohet adresa ne kete faze.';
    END IF;

    UPDATE public.orders
    SET
        full_name = trim(p_full_name),
        phone_number = trim(p_phone_number),
        country = v_country,
        city = trim(p_city),
        address = trim(p_address),
        status = CASE WHEN status = 'pending_confirmation' THEN 'confirmed' ELSE status END,
        updated_at = now()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

    RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to place bids" ON public.bids;
DROP POLICY IF EXISTS "Allow users to confirm their own order delivery details" ON public.orders;

REVOKE ALL ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_delivery(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
