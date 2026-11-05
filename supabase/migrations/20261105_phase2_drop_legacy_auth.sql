-- DESTRUCTIVE. Manual run only, after export is confirmed and owner approval is given in writing.
begin;
drop table if exists public.relay_queue cascade;
drop table if exists public.contacts cascade;
drop table if exists public.users cascade;
drop table if exists public.consent_log cascade;
commit;
