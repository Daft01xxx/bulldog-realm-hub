-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  reg TEXT,
  balance BIGINT DEFAULT 0,
  balance2 BIGINT DEFAULT 0,
  grow BIGINT DEFAULT 0,
  grow1 INTEGER DEFAULT 1,
  bone INTEGER DEFAULT 1000,
  referrals INTEGER DEFAULT 0,
  referred_by UUID,
  wallet_address TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- Add foreign key for referrals
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_referred_by_fkey 
FOREIGN KEY (referred_by) REFERENCES public.profiles(user_id);

-- Create wallet_data table for TON wallet information
CREATE TABLE public.wallet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  balance DECIMAL,
  nft_data JSONB,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for wallet_data
ALTER TABLE public.wallet_data ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_data
CREATE POLICY "Wallet data is viewable by everyone" 
ON public.wallet_data 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert wallet data" 
ON public.wallet_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update wallet data" 
ON public.wallet_data 
FOR UPDATE 
USING (true);

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