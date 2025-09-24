-- Add completed_tasks column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN completed_tasks TEXT DEFAULT '[]';