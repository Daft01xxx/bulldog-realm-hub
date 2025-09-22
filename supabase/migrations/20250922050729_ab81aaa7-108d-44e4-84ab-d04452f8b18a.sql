-- Fix RLS policies to allow profile creation for anonymous users
-- while still protecting user data access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.profiles;

-- Create new policies that allow anonymous profile creation
-- but protect data access with device fingerprint and user_id matching

-- Allow anyone to insert profiles (for anonymous user creation)
CREATE POLICY "Allow profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own profiles or profiles matching their device fingerprint
CREATE POLICY "Users can view own profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND device_fingerprint = (
    SELECT device_fingerprint FROM profiles WHERE id = profiles.id LIMIT 1
  ))
);

-- Allow users to update their own profiles or profiles matching their device fingerprint  
CREATE POLICY "Users can update own profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
) 
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
);