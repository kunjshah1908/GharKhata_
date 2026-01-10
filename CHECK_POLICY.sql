-- TEST: Check if the fixed RLS policy exists
-- Run this in Supabase SQL Editor to verify the fix was applied

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'family_members' 
AND cmd = 'INSERT';

-- Expected result: Should show policy named "Users can add first member or managers can add more"
-- If you see "Financial managers can add members" instead, the fix migration didn't run!
