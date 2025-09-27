-- Add miner fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_miner text DEFAULT 'default',
ADD COLUMN miner_level integer DEFAULT 1;