-- Add verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_phone text,
ADD COLUMN IF NOT EXISTS verification_email text,
ADD COLUMN IF NOT EXISTS verification_code text,
ADD COLUMN IF NOT EXISTS verification_code_expires timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_completed_at timestamp with time zone;

-- Create index for faster verification lookups
CREATE INDEX IF NOT EXISTS idx_profiles_verification_code ON public.profiles(verification_code) WHERE verification_code IS NOT NULL;

-- Create index for verified users
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(verified) WHERE verified = true;