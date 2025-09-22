-- Add RLS policy to allow anonymous users to update profiles by device fingerprint
CREATE POLICY "Anonymous users can update by device fingerprint" 
ON public.profiles 
FOR UPDATE 
USING ((auth.uid() IS NULL) AND (auth.role() = 'anon'::text) AND (device_fingerprint IS NOT NULL))
WITH CHECK ((auth.uid() IS NULL) AND (auth.role() = 'anon'::text) AND (device_fingerprint IS NOT NULL));