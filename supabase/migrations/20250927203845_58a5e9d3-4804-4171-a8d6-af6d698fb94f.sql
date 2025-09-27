-- Update miner income rates according to new requirements
CREATE OR REPLACE FUNCTION public.get_miner_hourly_income(miner_type text, miner_level integer)
 RETURNS bigint
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    CASE miner_type
        WHEN 'default' THEN RETURN 100 * miner_level;
        WHEN 'silver' THEN RETURN 1400 * miner_level;
        WHEN 'gold' THEN RETURN 2500 * miner_level;
        WHEN 'diamond' THEN RETURN 6000 * miner_level;
        WHEN 'premium' THEN RETURN 10000 * miner_level;
        WHEN 'plus' THEN RETURN 500 * miner_level;
        -- Keep other miners with existing values
        WHEN 'stellar' THEN RETURN 5000 * miner_level;
        WHEN 'quantum-harvester' THEN RETURN 10000 * miner_level;
        WHEN 'galactic-harvester' THEN RETURN 25000 * miner_level;
        WHEN 'void-driller' THEN RETURN 50000 * miner_level;
        WHEN 'solar-collector' THEN RETURN 100000 * miner_level;
        WHEN 'bone-extractor' THEN RETURN 250000 * miner_level;
        ELSE RETURN 100 * miner_level;
    END CASE;
END;
$function$