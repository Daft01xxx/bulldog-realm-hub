-- Add VPN detection and referral improvements to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_vpn_user boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_code_used boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_referral_code text,
ADD COLUMN IF NOT EXISTS referral_notifications jsonb DEFAULT '[]'::jsonb;