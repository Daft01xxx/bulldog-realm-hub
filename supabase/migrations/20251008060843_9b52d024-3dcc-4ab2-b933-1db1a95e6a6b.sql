-- Add nickname column to profiles table with unique constraint
ALTER TABLE public.profiles 
ADD COLUMN nickname text;

-- Create unique index for nickname (case-insensitive)
CREATE UNIQUE INDEX unique_nickname_case_insensitive 
ON public.profiles (LOWER(nickname));

-- Add check constraint for nickname format (alphanumeric and underscores, 3-20 characters)
ALTER TABLE public.profiles
ADD CONSTRAINT nickname_format_check 
CHECK (nickname ~ '^[a-zA-Z0-9_]{3,20}$');