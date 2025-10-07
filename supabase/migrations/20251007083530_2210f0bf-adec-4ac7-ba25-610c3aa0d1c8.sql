-- Add active_session_id to profiles table for single session enforcement
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_session_id text;

-- Add last_activity timestamp for session management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now();

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_profiles_active_session_id ON public.profiles(active_session_id);