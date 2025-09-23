-- Fix search path security warnings
CREATE OR REPLACE FUNCTION public.find_referrer_safely(referral_code text)
RETURNS TABLE(
    user_id uuid,
    reg text,
    referrals integer,
    v_bdog_earned bigint,
    referral_notifications jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.reg,
        p.referrals,
        p.v_bdog_earned,
        p.referral_notifications
    FROM public.profiles p
    WHERE p.reg = referral_code
    AND p.ban = 0
    LIMIT 1;
END;
$$;

-- Fix get_next_sunday_reset function search path
CREATE OR REPLACE FUNCTION public.get_next_sunday_reset()
RETURNS timestamp with time zone
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    next_sunday timestamp with time zone;
BEGIN
    -- Calculate next Sunday at 00:00:00 UTC
    next_sunday := date_trunc('week', now() + interval '1 week');
    RETURN next_sunday;
END;
$$;