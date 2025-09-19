-- Fix security issue: Move extensions from public to extensions schema
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

-- Create extensions in the extensions schema  
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update cron jobs with correct schema reference
SELECT cron.schedule(
  'daily-bone-reset',
  '0 0 * * *', -- every day at midnight
  $$
  SELECT
    net.http_post(
        url:='https://vvkmdaesochqkahscezp.supabase.co/functions/v1/daily-weekly-reset?type=daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a21kYWVzb2NocWthaHNjZXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDMxMjQsImV4cCI6MjA3Mzc3OTEyNH0.BZjHjBiHQ7BekZTvEcjerCkja189JwELwoO0K1Ls1wI"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'weekly-grow-reset-and-rewards',
  '0 0 * * 0', -- every Sunday at midnight
  $$
  SELECT
    net.http_post(
        url:='https://vvkmdaesochqkahscezp.supabase.co/functions/v1/daily-weekly-reset?type=weekly',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a21kYWVzb2NocWthaHNjZXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDMxMjQsImV4cCI6MjA3Mzc3OTEyNH0.BZjHjBiHQ7BekZTvEcjerCkja189JwELwoO0K1Ls1wI"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);