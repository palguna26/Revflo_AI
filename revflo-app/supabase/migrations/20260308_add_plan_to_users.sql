-- Migration: Add missing 'plan' column to public.users
-- Run this in Supabase SQL Editor to fix the trigger error

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan VARCHAR(50);
