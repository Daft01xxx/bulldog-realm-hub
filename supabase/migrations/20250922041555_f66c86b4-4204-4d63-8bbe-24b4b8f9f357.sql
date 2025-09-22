-- Phase 1: Critical Security Fixes for RLS Policies

-- First, drop existing overly permissive policies on profiles table
DROP POLICY IF EXISTS "Allow profile creation with device fingerprint" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile updates by device fingerprint" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profile by device fingerprint" ON public.profiles;

-- Create secure RLS policies for profiles table
-- Only allow authenticated users to access their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Secure wallet_data table - remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert wallet data" ON public.wallet_data;
DROP POLICY IF EXISTS "Anyone can update wallet data" ON public.wallet_data;
DROP POLICY IF EXISTS "Wallet data is viewable by everyone" ON public.wallet_data;

-- Create secure policies for wallet_data table
-- First, add user_id column to wallet_data to establish ownership
ALTER TABLE public.wallet_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create secure RLS policies for wallet_data
CREATE POLICY "Users can view own wallet data" ON public.wallet_data
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.wallet_address = wallet_data.wallet_address)
  )
);

CREATE POLICY "Users can insert own wallet data" ON public.wallet_data
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.wallet_address = wallet_data.wallet_address)
  )
);

CREATE POLICY "Users can update own wallet data" ON public.wallet_data
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.wallet_address = wallet_data.wallet_address)
  )
);

-- Create admin role system for secure admin access
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = check_role
  );
$$;

-- Create policy for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT 
USING (auth.uid() = user_id);

-- Add admin policies for profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for wallet_data table  
CREATE POLICY "Admins can view all wallet data" ON public.wallet_data
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all wallet data" ON public.wallet_data
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values);
$$;