-- Ensure required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Unschedule existing jobs if they exist (idempotent)
do $$ begin
  perform cron.unschedule('federal-sync-wed-sat-2335');
  perform cron.unschedule('federal-sync-wed-sat-2350');
  perform cron.unschedule('federal-sync-fallback-0005');
exception when others then null; end $$;

-- Schedule Loteria Federal sync at 20:35 BRT (23:35 UTC) every Wed (3) and Sat (6)
select cron.schedule(
  'federal-sync-wed-sat-2335',
  '35 23 * * 3,6',
  $$
  select net.http_post(
    url:='https://whqxpuyjxoiufzhvqneg.functions.supabase.co/federal-sync?auto_pick=1',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

-- Add a fallback run at 23:50 UTC (20:50 BRT) in case Caixa delays
select cron.schedule(
  'federal-sync-wed-sat-2350',
  '50 23 * * 3,6',
  $$
  select net.http_post(
    url:='https://whqxpuyjxoiufzhvqneg.functions.supabase.co/federal-sync?auto_pick=1',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

-- Final fallback at 00:05 UTC next day (21:05 BRT) to catch late postings
select cron.schedule(
  'federal-sync-fallback-0005',
  '5 0 * * 4,7',
  $$
  select net.http_post(
    url:='https://whqxpuyjxoiufzhvqneg.functions.supabase.co/federal-sync?auto_pick=1',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
