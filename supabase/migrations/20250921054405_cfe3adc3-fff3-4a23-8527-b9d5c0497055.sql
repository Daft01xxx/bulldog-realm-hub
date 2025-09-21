-- Fix security warnings by setting search_path for all functions

-- Update get_moscow_time function with proper search_path
CREATE OR REPLACE FUNCTION public.get_moscow_time()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOW() AT TIME ZONE 'Europe/Moscow';
$$;

-- Update get_next_sunday_reset function with proper search_path
CREATE OR REPLACE FUNCTION public.get_next_sunday_reset()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN EXTRACT(DOW FROM public.get_moscow_time()) = 0 
           AND EXTRACT(HOUR FROM public.get_moscow_time()) < 10 
      THEN 
        -- If it's Sunday and before 10 AM, next reset is today at 10 AM
        DATE_TRUNC('day', public.get_moscow_time()) + INTERVAL '10 hours'
      ELSE 
        -- Otherwise, next Sunday at 10 AM
        DATE_TRUNC('week', public.get_moscow_time()) + INTERVAL '6 days 10 hours'
    END;
$$;