-- Add WITH CHECK to the policy
DROP POLICY IF EXISTS "Users can update their profile by device" ON public.profiles;

CREATE POLICY "Users can update their profile by device"
ON public.profiles
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
);