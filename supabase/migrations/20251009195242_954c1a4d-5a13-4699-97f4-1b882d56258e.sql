-- Drop existing policy that might cause recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create simpler policy without recursion
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());