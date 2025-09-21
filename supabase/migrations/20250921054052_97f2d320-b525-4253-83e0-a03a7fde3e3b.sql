-- First, clean up duplicate IP addresses before adding constraint
-- Keep only the profile with highest grow for each IP address
WITH ranked_profiles AS (
  SELECT id, ip_address, grow,
         ROW_NUMBER() OVER (PARTITION BY ip_address ORDER BY grow DESC, created_at ASC) as rn
  FROM public.profiles
  WHERE ip_address IS NOT NULL
)
DELETE FROM public.profiles
WHERE id IN (
  SELECT id FROM ranked_profiles WHERE rn > 1
);

-- Add booster expiration tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS booster_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient booster cleanup queries
CREATE INDEX IF NOT EXISTS idx_profiles_booster_expires_at ON public.profiles(booster_expires_at) WHERE booster_expires_at IS NOT NULL;

-- Now add unique constraint on IP address
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_ip_address UNIQUE (ip_address);

-- Create function to get current Moscow time
CREATE OR REPLACE FUNCTION public.get_moscow_time()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
STABLE
AS $$
  SELECT NOW() AT TIME ZONE 'Europe/Moscow';
$$;

-- Create function to check if user has active booster
CREATE OR REPLACE FUNCTION public.has_active_booster(user_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_profile_id 
    AND booster_expires_at IS NOT NULL 
    AND booster_expires_at > NOW()
    AND grow1 >= 2
  );
$$;

-- Create function to reset expired boosters
CREATE OR REPLACE FUNCTION public.reset_expired_boosters()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH updated_profiles AS (
    UPDATE public.profiles 
    SET grow1 = 1, booster_expires_at = NULL
    WHERE booster_expires_at IS NOT NULL 
    AND booster_expires_at <= NOW()
    AND grow1 > 1
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER FROM updated_profiles;
$$;

-- Create function to get next Sunday 10:00 Moscow time
CREATE OR REPLACE FUNCTION public.get_next_sunday_reset()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    CASE 
      WHEN EXTRACT(DOW FROM public.get_moscow_time()) = 0 
           AND EXTRACT(HOUR FROM public.get_moscow_time()) < 10 
      THEN 
        -- If it's Sunday and before 10 AM, next reset is today at 10 AM
        DATE_TRUNC('day', public.get_moscow_time()) + INTERVAL '10 hours'
      ELSE 
        -- Otherwise, next Sunday at 10 AM
        DATE_TRUNC('week', public.get_moscow_time()) + INTERVAL '6 days 10 hours'
    END;
$$;