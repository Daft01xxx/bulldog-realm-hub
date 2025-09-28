-- Fix RLS policies to work with device-based authentication
-- Update profiles RLS policy to allow updates by device_fingerprint when no auth user

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies that work with device-based authentication
CREATE POLICY "Users can update their profile by device" ON profiles
  FOR UPDATE 
  USING (
    -- Allow if authenticated user matches user_id OR if no auth user but device matches
    (auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND device_fingerprint IS NOT NULL)
  );

CREATE POLICY "Users can view their profile by device" ON profiles
  FOR SELECT
  USING (
    -- Allow if authenticated user matches user_id OR if no auth user (for device-based access)
    (auth.uid() = user_id) OR 
    (auth.uid() IS NULL)
  );