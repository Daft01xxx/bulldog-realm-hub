-- Reset all user data to default values
TRUNCATE TABLE public.profiles CASCADE;

-- Reset promocode usage
TRUNCATE TABLE public.promocode_usage CASCADE;

-- Reset wallet data
TRUNCATE TABLE public.wallet_data CASCADE;