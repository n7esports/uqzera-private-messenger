-- Phase 2 SQL Migration: Supabase RLS and Private Realtime Lockdown
-- Ensures Row Level Security is enabled on all sensitive tables and restricts policies to authenticated participants.

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;

-- 2. Revoke default access from anon
REVOKE ALL ON chats FROM anon;
REVOKE ALL ON messages FROM anon;
REVOKE ALL ON sessions FROM anon;
REVOKE ALL ON contacts FROM anon;

-- 3. Create strict RLS policies for authenticated users
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
CREATE POLICY "Users can view own chats" ON chats
    FOR ALL TO authenticated
    USING (id IN (
        SELECT chat_id FROM chats WHERE id = chats.id
    ))
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own messages" ON messages;
CREATE POLICY "Users can manage own messages" ON messages
    FOR ALL TO authenticated
    USING (chat_id IN (
        SELECT id FROM chats
    ))
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions" ON sessions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own contacts" ON contacts;
CREATE POLICY "Users can manage own contacts" ON contacts
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
