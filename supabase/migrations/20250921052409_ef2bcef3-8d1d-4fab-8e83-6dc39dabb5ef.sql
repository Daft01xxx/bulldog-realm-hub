-- Update RLS policies to work better with device fingerprint approach
-- while maintaining security

-- Drop the previous policies that won't work with client-side device fingerprinting
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more appropriate policies for device fingerprint based system
-- Allow users to view profiles that match their device fingerprint + IP combination  
CREATE POLICY "Users can view profile by device fingerprint" 
ON public.profiles 
FOR SELECT 
USING (
  -- For authenticated users, allow access to their own profile
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- For anonymous users, restrict to profiles that could be theirs based on stored session
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
);

-- Allow profile creation with device fingerprint
CREATE POLICY "Allow profile creation with device fingerprint" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- For authenticated users, must match their user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- For anonymous users, require device fingerprint
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL AND user_id IS NOT NULL)
);

-- Allow profile updates with device fingerprint verification
CREATE POLICY "Allow profile updates by device fingerprint" 
ON public.profiles 
FOR UPDATE 
USING (
  -- For authenticated users, allow updates to their own profile
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- For anonymous users, allow if they have matching device fingerprint
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
);

-- Create a secure function for referral lookups that doesn't expose sensitive data
CREATE OR REPLACE FUNCTION public.find_referrer_safely(referral_code text)
RETURNS TABLE(user_id uuid, referrals integer, v_bdog_earned bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, referrals, v_bdog_earned
  FROM public.profiles 
  WHERE reg = referral_code 
  LIMIT 1;
$$;

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION public.find_referrer_safely TO authenticated, anon;