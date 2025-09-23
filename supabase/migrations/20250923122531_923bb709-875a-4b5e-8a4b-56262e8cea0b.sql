-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_vpn_user boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS v_bdog_earned bigint DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_fingerprint text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code_used boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_referral_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_notifications jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS booster_expires_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bdog_balance numeric DEFAULT 0;

-- Create find_referrer_safely function
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

-- Create get_next_sunday_reset function
CREATE OR REPLACE FUNCTION public.get_next_sunday_reset()
RETURNS timestamp with time zone
LANGUAGE plpgsql
AS $$
DECLARE
    next_sunday timestamp with time zone;
BEGIN
    -- Calculate next Sunday at 00:00:00 UTC
    next_sunday := date_trunc('week', now() + interval '1 week');
    RETURN next_sunday;
END;
$$;