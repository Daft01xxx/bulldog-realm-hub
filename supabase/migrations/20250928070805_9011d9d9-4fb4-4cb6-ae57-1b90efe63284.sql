-- Create a test promocode for testing
INSERT INTO public.promocodes (code, v_bdog_reward, is_active) 
VALUES ('BDOGAPP', 1000, true)
ON CONFLICT (code) DO UPDATE 
SET v_bdog_reward = 1000, is_active = true;