-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_profiles_grow ON public.profiles(grow DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_bone ON public.profiles(bone);
CREATE INDEX IF NOT EXISTS idx_profiles_reg ON public.profiles(reg);

-- Create function to reset expired boosters without notifications
CREATE OR REPLACE FUNCTION public.reset_expired_boosters()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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