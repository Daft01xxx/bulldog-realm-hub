-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.reset_expired_boosters()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    reset_count INTEGER := 0;
BEGIN
    -- Reset expired boosters (set grow1 to 1 and clear booster_expires_at)
    UPDATE public.profiles 
    SET 
        grow1 = 1,
        booster_expires_at = NULL
    WHERE 
        booster_expires_at IS NOT NULL 
        AND booster_expires_at < NOW();
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    
    RETURN reset_count;
END;
$$;