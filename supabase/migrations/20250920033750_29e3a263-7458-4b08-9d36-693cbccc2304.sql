-- Remove existing cron jobs
SELECT cron.unschedule('daily-bone-reset') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-bone-reset');
SELECT cron.unschedule('weekly-grow-reset-and-rewards') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-grow-reset-and-rewards');

-- Create daily bone reset cron job with service role key
SELECT cron.schedule(
  'daily-bone-reset',
  '0 0 * * *', -- every day at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://vvkmdaesochqkahscezp.supabase.co/functions/v1/daily-weekly-reset?type=daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a21kYWVzb2NocWthaHNjZXpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMzEyNCwiZXhwIjoyMDczNzc5MTI0fQ.c5cYBIm8R3gO2lsKB_8TYNqkjLrDgcBZ-vdwB1yBc7E"}'::jsonb,
        body:='{"timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Create weekly grow reset cron job with service role key  
SELECT cron.schedule(
  'weekly-grow-reset-and-rewards',
  '0 0 * * 0', -- every Sunday at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://vvkmdaesochqkahscezp.supabase.co/functions/v1/daily-weekly-reset?type=weekly',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a21kYWVzb2NocWthaHNjZXpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMzEyNCwiZXhwIjoyMDczNzc5MTI0fQ.c5cYBIm8R3gO2lsKB_8TYNqkjLrDgcBZ-vdwB1yBc7E"}'::jsonb,
        body:='{"timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);