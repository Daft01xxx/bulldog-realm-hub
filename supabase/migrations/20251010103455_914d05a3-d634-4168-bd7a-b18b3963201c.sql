-- Update the miner rewards distribution function to use grid miners
CREATE OR REPLACE FUNCTION public.distribute_grid_miner_rewards()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    reward_count INTEGER := 0;
    user_record RECORD;
    total_hourly_income BIGINT;
BEGIN
    -- Loop through all users who have miners on grid
    FOR user_record IN 
        SELECT DISTINCT p.user_id, p.v_bdog_earned, p.last_miner_reward_at
        FROM public.profiles p
        WHERE EXISTS (
            SELECT 1 FROM public.user_miners um 
            WHERE um.user_id = p.user_id 
            AND um.is_on_grid = true
        )
        AND p.last_miner_reward_at < (now() - interval '1 hour')
    LOOP
        -- Calculate total income from all grid miners
        SELECT COALESCE(SUM(hourly_income), 0)
        INTO total_hourly_income
        FROM public.user_miners
        WHERE user_id = user_record.user_id
        AND is_on_grid = true;
        
        -- Only update if there's income to give
        IF total_hourly_income > 0 THEN
            -- Update user's balance and reward time
            UPDATE public.profiles 
            SET 
                v_bdog_earned = COALESCE(v_bdog_earned, 0) + total_hourly_income,
                last_miner_reward_at = now(),
                updated_at = now()
            WHERE user_id = user_record.user_id;
            
            reward_count := reward_count + 1;
        END IF;
    END LOOP;
    
    RETURN reward_count;
END;
$function$;