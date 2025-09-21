-- Add BAN field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN ban integer DEFAULT 0;