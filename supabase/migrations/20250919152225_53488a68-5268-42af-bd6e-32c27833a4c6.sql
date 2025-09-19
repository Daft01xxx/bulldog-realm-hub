-- Add BDOG token balance and V-BDOG earned columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN bdog_balance numeric DEFAULT 0,
ADD COLUMN v_bdog_earned bigint DEFAULT 0;

-- Update the trigger to handle the new columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;