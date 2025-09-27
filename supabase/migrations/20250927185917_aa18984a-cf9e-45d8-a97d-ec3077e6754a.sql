-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to distribute miner rewards every hour
SELECT cron.schedule(
  'hourly-miner-rewards',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://rsmgzhcniugipmektztq.supabase.co/functions/v1/hourly-miner-rewards',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWd6aGNuaXVnaXBtZWt0enRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNzQzNzEsImV4cCI6MjA3MzY1MDM3MX0.L43mgdhefrDC-unigJUhbVibfiHOV3a3D5ER7RDw-js"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);