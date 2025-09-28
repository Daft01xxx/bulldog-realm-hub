-- Ensure we have a working test promocode
INSERT INTO promocodes (code, v_bdog_reward, is_active, created_at) 
VALUES ('BDOGTEST2025', 1000, true, now())
ON CONFLICT (code) DO UPDATE SET 
  v_bdog_reward = 1000,
  is_active = true;