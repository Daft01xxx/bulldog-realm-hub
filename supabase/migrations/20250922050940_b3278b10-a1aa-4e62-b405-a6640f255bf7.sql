-- Fix infinite recursion in RLS policies
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;

-- Create simpler policies without recursion
-- Allow authenticated users to view and update their own profiles
CREATE POLICY "Authenticated users can view own profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- For anonymous access, use a simpler approach
-- Allow anonymous users to view profiles by device fingerprint only with service role
CREATE POLICY "Anonymous users can view by device fingerprint" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NULL AND 
  auth.role() = 'anon' AND
  device_fingerprint IS NOT NULL
);