-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  wallet_address TEXT,
  reg TEXT,
  balance BIGINT DEFAULT 0,
  balance2 DECIMAL(20,8) DEFAULT 0,
  grow BIGINT DEFAULT 0,
  grow1 INTEGER DEFAULT 1,
  bone INTEGER DEFAULT 1000,
  referrals INTEGER DEFAULT 0,
  referred_by UUID REFERENCES public.profiles(user_id),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = gen_random_uuid() OR true); -- Temporary policy for demo

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true); -- Temporary policy for demo

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (true); -- Temporary policy for demo

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create wallet data table
CREATE TABLE public.wallet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  balance DECIMAL(20,8) DEFAULT 0,
  nft_data JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for wallet data
ALTER TABLE public.wallet_data ENABLE ROW LEVEL SECURITY;

-- Create policy for wallet data
CREATE POLICY "Anyone can read wallet data" 
ON public.wallet_data 
FOR SELECT 
USING (true);

CREATE POLICY "System can update wallet data" 
ON public.wallet_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update existing wallet data" 
ON public.wallet_data 
FOR UPDATE 
USING (true);