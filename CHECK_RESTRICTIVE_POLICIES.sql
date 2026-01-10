-- Check for RESTRICTIVE policies that might be blocking
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,  -- Should be 'PERMISSIVE' (if 'RESTRICTIVE', that's the problem)
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'families'
ORDER BY permissive DESC, cmd, policyname;

-- Also check if there's a default deny policy
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as force_rls
FROM pg_class
WHERE relname = 'families';
