-- Update the get_next_sunday_reset function to use 20:00 (8 PM) instead of 10:00 AM
CREATE OR REPLACE FUNCTION public.get_next_sunday_reset()
 RETURNS timestamp with time zone
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    CASE 
      WHEN EXTRACT(DOW FROM public.get_moscow_time()) = 0 
           AND EXTRACT(HOUR FROM public.get_moscow_time()) < 20 
      THEN 
        -- If it's Sunday and before 8 PM, next reset is today at 8 PM
        DATE_TRUNC('day', public.get_moscow_time()) + INTERVAL '20 hours'
      ELSE 
        -- Otherwise, next Sunday at 8 PM
        DATE_TRUNC('week', public.get_moscow_time()) + INTERVAL '6 days 20 hours'
    END;
$function$;