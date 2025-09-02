# CREATE INDEX CONCURRENTLY — Runbook (Supabase)

## Project
- Supabase project ref: **whqxpuyjxoiufzhvqneg**

## When to use
Use `CREATE INDEX CONCURRENTLY` when:
- Table is large (≈100k–1M+ rows).
- It’s actively written (INSERT/UPDATE/DELETE).
- You cannot block writes during the build.

If the table is small/quiet → prefer a normal `CREATE INDEX` (migration-safe, faster).

## What it does
- Builds the index in phases so reads/writes keep working.
- Still takes brief metadata locks (schema ops may wait).
- **Must run outside a transaction.** The web SQL editor/migration blocks wrap in a txn → will fail.

## How to run (Supabase CLI, project: whqxpuyjxoiufzhvqneg)
```bash
# install once
npm i -g supabase

# login once
supabase login

# link to our project
supabase link --project-ref whqxpuyjxoiufzhvqneg

# open psql (no transaction wrapper)
supabase db connect
```