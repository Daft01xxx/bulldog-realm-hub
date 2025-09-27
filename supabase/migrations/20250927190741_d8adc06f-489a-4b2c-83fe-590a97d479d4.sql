-- Update existing profiles to have default miner values
UPDATE public.profiles 
SET 
    current_miner = COALESCE(current_miner, 'default'),
    miner_level = COALESCE(miner_level, 1),
    last_miner_reward_at = COALESCE(last_miner_reward_at, now())
WHERE current_miner IS NULL OR miner_level IS NULL OR last_miner_reward_at IS NULL;