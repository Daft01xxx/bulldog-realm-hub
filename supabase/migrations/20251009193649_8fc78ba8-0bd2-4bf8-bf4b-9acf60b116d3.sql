-- Add admin login attempts tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS admin_access_blocked BOOLEAN DEFAULT FALSE;