-- All-in-one master migration for Uqzera Private Messenger.
-- Run this single file in Supabase Dashboard -> SQL Editor.
-- Drops existing tables (CASCADE) then recreates them with strict RLS.

BEGIN;

DROP TABLE IF EXISTS public.relay_queue   CASCADE;
DROP TABLE IF EXISTS public.users         CASCADE;
DROP TABLE IF EXISTS public.contacts      CASCADE;
DROP TABLE IF EXISTS public.consent_log   CASCADE;

CREATE TABLE public.users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias        text NOT NULL UNIQUE CHECK (length(alias) BETWEEN 3 AND 32),
  pin_hash     text NOT NULL,
  profile_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX users_alias_idx ON public.users (alias);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.users FROM anon;
REVOKE ALL ON public.users FROM authenticated;
CREATE POLICY "users_self_select" ON public.users FOR SELECT TO authenticated USING (id = auth.uid());

CREATE TABLE public.relay_queue (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_key  text NOT NULL,
  ciphertext     text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX relay_queue_recipient_idx ON public.relay_queue (recipient_key, created_at);
ALTER TABLE public.relay_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relay_queue FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.relay_queue FROM anon;
REVOKE ALL ON public.relay_queue FROM authenticated;
CREATE POLICY "relay_service_only" ON public.relay_queue TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.contacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id  uuid REFERENCES public.users(id) ON DELETE CASCADE,
  alias       text NOT NULL,
  public_key  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.contacts FROM anon;
CREATE POLICY "contacts_owner_read"   ON public.contacts FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "contacts_owner_insert" ON public.contacts FOR INSERT  TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "contacts_owner_delete" ON public.contacts FOR DELETE  TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.consent_log (
  id         bigserial PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_id    text,
  kind       text NOT NULL CHECK (kind IN ('tos', 'privacy', 'cookies', 'marketing')),
  version    text NOT NULL,
  granted    boolean NOT NULL,
  ip         inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_log FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.consent_log FROM anon;
CREATE POLICY "consent_self_insert" ON public.consent_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "consent_self_read"   ON public.consent_log FOR SELECT TO authenticated USING (auth.uid() = user_id);

COMMIT;
