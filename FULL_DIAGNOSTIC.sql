-- COMPREHENSIVE DIAGNOSTIC FOR FAMILIES INSERT ISSUE
-- Run this entire script and share ALL the results

-- 1. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'families' AND schemaname = 'public';

-- 2. Check ALL policies on families table
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'families'
ORDER BY cmd, policyname;

-- 3. Try a direct INSERT as the authenticated user (this will test if RLS works)
-- Replace 'YOUR_USER_ID' with the actual user ID from the console log (52faf6b6-1804-484e-a8c5-88276900779a)
-- NOTE: This will only work if you run it while logged in via the SQL editor with your auth token

-- First, let's check what the current auth.uid() is
SELECT auth.uid() as current_user_id;

-- 4. Check if there are any triggers that might be blocking
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'families';

-- 5. Test the helper function
SELECT public.is_financial_manager('52faf6b6-1804-484e-a8c5-88276900779a'::uuid, '00000000-0000-0000-0000-000000000000'::uuid);

-- 6. Check if there are any default values causing issues
SELECT 
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'families' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Try to manually insert a test family (THIS IS THE KEY TEST)
-- This will tell us if the policy actually works or if there's another issue
INSERT INTO public.families (name, currency, month_start_day)
VALUES ('Test Family Direct', 'USD', 1)
RETURNING *;
