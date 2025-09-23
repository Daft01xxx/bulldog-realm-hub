-- Update existing profiles to have numeric reg values (9 digits)
UPDATE profiles 
SET reg = (100000000 + (RANDOM() * 900000000)::INT)::TEXT
WHERE reg IS NULL OR reg NOT SIMILAR TO '[0-9]{9}';

-- Set default value for new bone column to 1000 if it doesn't exist
ALTER TABLE profiles 
ALTER COLUMN bone SET DEFAULT 1000;