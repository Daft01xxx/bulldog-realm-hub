-- Разбанить всех пользователей
UPDATE public.profiles 
SET ban = 0, is_vpn_user = false 
WHERE ban = 1 OR is_vpn_user = true;