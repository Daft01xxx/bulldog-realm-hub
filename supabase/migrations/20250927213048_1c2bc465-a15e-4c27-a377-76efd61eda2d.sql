-- Add column to track if miner is active
ALTER TABLE public.profiles 
ADD COLUMN miner_active BOOLEAN DEFAULT false;

-- Update existing users to have inactive miners by default
UPDATE public.profiles 
SET miner_active = false 
WHERE miner_active IS NULL;