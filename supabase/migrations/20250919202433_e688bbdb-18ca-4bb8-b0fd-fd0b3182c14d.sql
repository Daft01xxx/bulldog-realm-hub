-- Add device_fingerprint column to profiles table for device identification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

-- Create index on ip_address and device_fingerprint for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_ip_device ON public.profiles(ip_address, device_fingerprint);

-- Create unique constraint to ensure only one profile per IP + device combination
-- First drop existing constraint if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_ip_device_profile') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT unique_ip_device_profile;
    END IF;
END $$;

-- Add the unique constraint
ALTER TABLE public.profiles ADD CONSTRAINT unique_ip_device_profile UNIQUE (ip_address, device_fingerprint);