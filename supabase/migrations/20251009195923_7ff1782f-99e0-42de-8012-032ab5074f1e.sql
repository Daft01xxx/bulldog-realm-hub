-- Fix RLS policy to allow updates by device fingerprint without auth
DROP POLICY IF EXISTS "Users can update their profile by device" ON public.profiles;

-- Create policy that allows updates by either auth.uid OR device_fingerprint
CREATE POLICY "Users can update their profile by device"
ON public.profiles
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
);