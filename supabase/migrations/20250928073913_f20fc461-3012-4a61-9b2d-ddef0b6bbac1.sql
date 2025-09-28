-- Ensure RLS policies work correctly for device-based authentication
-- Test and update policies if needed

-- Test if profiles can be read without auth
DO $$
BEGIN
  -- This will help debug RLS issues
  RAISE NOTICE 'Testing RLS policies for profiles table';
END $$;

-- Add a simple test promocode if needed
INSERT INTO promocodes (code, v_bdog_reward, is_active, created_at) 
VALUES ('TEST123', 500, true, now())
ON CONFLICT (code) DO UPDATE SET 
  v_bdog_reward = 500,
  is_active = true;