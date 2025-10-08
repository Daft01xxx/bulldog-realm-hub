-- Add BDOG ID and password fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bdog_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bdog_password TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_bdog_id ON public.profiles(bdog_id);

-- Function to generate unique BDOG ID
CREATE OR REPLACE FUNCTION public.generate_bdog_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'BDOG';
    i INTEGER;
    random_char TEXT;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        result := 'BDOG';
        FOR i IN 1..12 LOOP
            random_char := substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
            result := result || random_char;
        END LOOP;
        
        -- Check if ID is unique
        SELECT NOT EXISTS(SELECT 1 FROM public.profiles WHERE bdog_id = result) INTO is_unique;
    END LOOP;
    
    RETURN result;
END;
$$;

-- Function to generate random password
CREATE OR REPLACE FUNCTION public.generate_random_password()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#%';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    RETURN result;
END;
$$;