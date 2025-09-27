-- Create a cron job to automatically distribute miner rewards every hour
SELECT cron.schedule(
  'hourly-miner-rewards',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://rsmgzhcniugipmektztq.supabase.co/functions/v1/hourly-miner-rewards',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWd6aGNuaXVnaXBtZWt0enRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDM3MSwiZXhwIjoyMDczNjUwMzcxfQ.0RJZUjOKhpSrr3Ckn9y3AcHvr9RfyX8nnbrwJp1zHIE"}'::jsonb,
    body := '{"timestamp": "' || now() || '"}'::jsonb
  ) AS request_id;
  $$
);