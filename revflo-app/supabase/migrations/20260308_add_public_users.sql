-- Migration: Add missing public.users table to fix signup trigger errors
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    name VARCHAR(255),
    avatar_url TEXT,
    auth_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Assuming the `on_auth_user_created` trigger is already trying to insert here, 
-- we additionally create an IF NOT EXISTS function/trigger in case it was dropped but the error is just the table.
-- Wait, the error explicitly says `relation "public.users" does not exist`. 
-- So the trigger exists but the table is missing.
