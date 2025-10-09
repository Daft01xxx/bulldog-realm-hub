-- Add admin role to user with BDOG ID BDOGG7S52RAODZAE
INSERT INTO public.user_roles (user_id, role) 
SELECT user_id, 'admin'::app_role 
FROM public.profiles 
WHERE bdog_id = 'BDOGG7S52RAODZAE'
ON CONFLICT (user_id, role) DO NOTHING;