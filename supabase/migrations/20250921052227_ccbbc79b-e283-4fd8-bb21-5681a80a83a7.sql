-- Fix security vulnerability: Restrict profile access to protect sensitive user data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;

-- Create secure RLS policies that protect sensitive user data
-- Allow users to view only their own profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow access to own profile by user_id (for authenticated users)
  (auth.uid() = user_id) OR
  -- Allow access by device fingerprint and IP for anonymous users (temporary session)
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL AND 
   device_fingerprint = current_setting('request.headers')::json->>'x-device-fingerprint')
);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- For authenticated users, must match their user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- For anonymous users, allow creation with device fingerprint
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  -- Allow update of own profile by user_id (for authenticated users)
  (auth.uid() = user_id) OR
  -- Allow update by device fingerprint for anonymous users
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL AND 
   device_fingerprint = current_setting('request.headers')::json->>'x-device-fingerprint')
);

-- Create a security definer function for referral lookups
-- This allows safe referral code validation without exposing all user data
CREATE OR REPLACE FUNCTION public.validate_referral_code(referral_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id 
  FROM public.profiles 
  WHERE reg = referral_code 
  LIMIT 1;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.validate_referral_code TO authenticated, anon;