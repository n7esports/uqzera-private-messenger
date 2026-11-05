-- Read-only consent export source. Export the query result as CSV outside the
-- repository and verify the export before any manual destructive migration.
-- The IP column is intentionally omitted.
SELECT
  id,
  user_id,
  anon_id,
  kind,
  version,
  granted,
  created_at
FROM public.consent_log
ORDER BY id;
