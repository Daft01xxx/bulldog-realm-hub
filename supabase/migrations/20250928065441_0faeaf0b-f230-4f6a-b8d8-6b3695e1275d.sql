-- Update promocode_usage table to allow system-wide inserts
DROP POLICY IF EXISTS "Users can insert their own promocode usage" ON public.promocode_usage;

CREATE POLICY "System can insert promocode usage" 
ON public.promocode_usage 
FOR INSERT 
WITH CHECK (true);

-- Update profiles table to allow system updates for V-BDOG earnings
CREATE POLICY "System can update v_bdog_earned" 
ON public.profiles 
FOR UPDATE 
USING (true);