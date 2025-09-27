-- Add column to track last miner reward time
ALTER TABLE public.profiles 
ADD COLUMN last_miner_reward_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create function to calculate miner income based on type and level
CREATE OR REPLACE FUNCTION public.get_miner_hourly_income(miner_type text, miner_level integer)
RETURNS bigint
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    CASE miner_type
        WHEN 'default' THEN RETURN 100 * miner_level;
        WHEN 'silver' THEN RETURN 250 * miner_level;
        WHEN 'gold' THEN RETURN 500 * miner_level;
        WHEN 'diamond' THEN RETURN 1000 * miner_level;
        WHEN 'premium' THEN RETURN 2000 * miner_level;
        WHEN 'stellar' THEN RETURN 5000 * miner_level;
        WHEN 'quantum-harvester' THEN RETURN 10000 * miner_level;
        WHEN 'galactic-harvester' THEN RETURN 25000 * miner_level;
        WHEN 'void-driller' THEN RETURN 50000 * miner_level;
        WHEN 'solar-collector' THEN RETURN 100000 * miner_level;
        WHEN 'bone-extractor' THEN RETURN 250000 * miner_level;
        WHEN 'plus' THEN RETURN 500000 * miner_level;
        ELSE RETURN 100 * miner_level;
    END CASE;
END;
$$;

-- Create function to distribute hourly miner rewards
CREATE OR REPLACE FUNCTION public.distribute_miner_rewards()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    reward_count INTEGER := 0;
    user_record RECORD;
    hourly_income BIGINT;
BEGIN
    -- Update rewards for users whose last reward was more than 1 hour ago
    FOR user_record IN 
        SELECT user_id, current_miner, miner_level, last_miner_reward_at, v_bdog_earned
        FROM public.profiles 
        WHERE last_miner_reward_at < (now() - interval '1 hour')
    LOOP
        -- Calculate income for this user's miner
        hourly_income := get_miner_hourly_income(
            COALESCE(user_record.current_miner, 'default'), 
            COALESCE(user_record.miner_level, 1)
        );
        
        -- Update user's balance and reward time
        UPDATE public.profiles 
        SET 
            v_bdog_earned = COALESCE(v_bdog_earned, 0) + hourly_income,
            last_miner_reward_at = now(),
            updated_at = now()
        WHERE user_id = user_record.user_id;
        
        reward_count := reward_count + 1;
    END LOOP;
    
    RETURN reward_count;
END;
$$;