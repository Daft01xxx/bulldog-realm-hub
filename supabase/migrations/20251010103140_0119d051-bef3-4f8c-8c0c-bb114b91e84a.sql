-- Create table for user's miner inventory
CREATE TABLE IF NOT EXISTS public.user_miners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  miner_id TEXT NOT NULL,
  miner_name TEXT NOT NULL,
  purchase_price BIGINT NOT NULL,
  hourly_income BIGINT NOT NULL,
  miner_category TEXT NOT NULL CHECK (miner_category IN ('regular', 'powerful', 'limited')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_on_grid BOOLEAN DEFAULT false,
  grid_position INTEGER CHECK (grid_position >= 1 AND grid_position <= 3),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Enable RLS on user_miners
ALTER TABLE public.user_miners ENABLE ROW LEVEL SECURITY;

-- Users can view their own miners
CREATE POLICY "Users can view their own miners"
ON public.user_miners
FOR SELECT
USING (auth.uid() IS NULL OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = user_miners.user_id 
  AND (profiles.user_id = auth.uid() OR profiles.device_fingerprint IS NOT NULL)
));

-- Users can insert their own miners
CREATE POLICY "Users can insert their own miners"
ON public.user_miners
FOR INSERT
WITH CHECK (auth.uid() IS NULL OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = user_miners.user_id 
  AND (profiles.user_id = auth.uid() OR profiles.device_fingerprint IS NOT NULL)
));

-- Users can update their own miners
CREATE POLICY "Users can update their own miners"
ON public.user_miners
FOR UPDATE
USING (auth.uid() IS NULL OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = user_miners.user_id 
  AND (profiles.user_id = auth.uid() OR profiles.device_fingerprint IS NOT NULL)
));

-- Users can delete their own miners (for selling)
CREATE POLICY "Users can delete their own miners"
ON public.user_miners
FOR DELETE
USING (auth.uid() IS NULL OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = user_miners.user_id 
  AND (profiles.user_id = auth.uid() OR profiles.device_fingerprint IS NOT NULL)
));

-- Create index for faster queries
CREATE INDEX idx_user_miners_user_id ON public.user_miners(user_id);
CREATE INDEX idx_user_miners_grid ON public.user_miners(user_id, is_on_grid) WHERE is_on_grid = true;

-- Add column to track referral rewards count
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_rewards_given INTEGER DEFAULT 0;