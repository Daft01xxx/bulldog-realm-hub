-- Remove old cron jobs
SELECT cron.unschedule('daily-bone-reset');
SELECT cron.unschedule('weekly-grow-reset-and-rewards');

-- Create proper daily reset cron job (runs every day at 00:00)
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

-- Create proper weekly reset cron job (runs every Sunday at 00:00)
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