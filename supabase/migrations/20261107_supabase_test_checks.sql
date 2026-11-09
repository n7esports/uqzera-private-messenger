-- READ-ONLY TEST CHECKS. Safe to run. No data changes.
select current_database(), current_user, now();
select table_name from information_schema.tables where table_schema = 'public' order by table_name;
select relname, relrowsecurity from pg_class join pg_namespace n on n.oid = relnamespace where n.nspname = 'public' and relkind = 'r';
