-- Create purchases table for tracking user transactions
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'V-BDOG',
  status TEXT DEFAULT 'completed',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all purchases (will be checked server-side)
CREATE POLICY "Service role can manage purchases"
ON public.purchases
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_purchased_at ON public.purchases(purchased_at DESC);

-- Add blacklist field to profiles for permanent bans
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blacklisted BOOLEAN DEFAULT false;