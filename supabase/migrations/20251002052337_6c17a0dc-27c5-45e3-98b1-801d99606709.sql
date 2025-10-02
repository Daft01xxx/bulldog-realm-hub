-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily bone reset at 23:59 Moscow time (20:59 UTC)
-- Moscow is UTC+3, so 23:59 MSK = 20:59 UTC
SELECT cron.schedule(
  'daily-bone-reset',
  '59 20 * * *', -- At 20:59 UTC (23:59 MSK) every day
  $$
  SELECT
    net.http_post(
        url:='https://rsmgzhcniugipmektztq.supabase.co/functions/v1/daily-weekly-reset?type=daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWd6aGNuaXVnaXBtZWt0enRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNzQzNzEsImV4cCI6MjA3MzY1MDM3MX0.L43mgdhefrDC-unigJUhbVibfiHOV3a3D5ER7RDw-js"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- View scheduled jobs (for debugging)
-- SELECT * FROM cron.job;