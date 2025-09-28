-- Create promocodes table
CREATE TABLE public.promocodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  v_bdog_reward BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promocode_usage table to track who used which promocodes
CREATE TABLE public.promocode_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  promocode_id UUID NOT NULL REFERENCES public.promocodes(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, promocode_id)
);

-- Enable RLS on both tables
ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocode_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for promocodes (read-only for authenticated users)
CREATE POLICY "Users can view active promocodes" 
ON public.promocodes 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS policies for promocode_usage (users can only see their own usage)
CREATE POLICY "Users can view their own promocode usage" 
ON public.promocode_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own promocode usage" 
ON public.promocode_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Insert initial promocodes
INSERT INTO public.promocodes (code, v_bdog_reward) VALUES
('D3LOWQE', 1000000),
('BDOG_ON_DEX', 30000),
('BDOGTOP', 10000),
('BDOGAPP', 10000),
('BDOGWALLET', 10000);

-- Create trigger for updated_at
CREATE TRIGGER update_promocodes_updated_at
BEFORE UPDATE ON public.promocodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();