# Open a psql session for Supabase project whqxpuyjxoiufzhvqneg

```bash
# Install CLI (once)
npm i -g supabase

# Authenticate (once)
supabase login

# Link to our project (once)
supabase link --project-ref whqxpuyjxoiufzhvqneg

# Open a direct psql session (no transaction wrapper)
supabase db connect
```

Tips:
- From the psql prompt, you can run the concurrent index script:
  \i sql/ops/indexes/partial_raffles_user_ac_created_concurrent.sql
- Ensure you’re not inside an explicit BEGIN/COMMIT block before running CONCURRENTLY.
