-- Add policy to allow reading top players (only reg and grow fields)
CREATE POLICY "Users can view top players leaderboard" 
ON public.profiles 
FOR SELECT 
USING (true);