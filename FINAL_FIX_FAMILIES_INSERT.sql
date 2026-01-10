-- FINAL FIX FOR FAMILIES TABLE INSERT
-- The policy exists but might have restrictive USING clause or need to be recreated

-- Step 1: Drop the current INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create families" ON public.families;

-- Step 2: Recreate with explicit USING clause (not just WITH CHECK)
CREATE POLICY "Authenticated users can create families"
ON public.families 
FOR INSERT 
TO public
WITH CHECK (auth.uid() IS NOT NULL);

-- Step 3: Verify it was created correctly
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'families' AND cmd = 'INSERT';

-- Step 4: Also check if RLS is enabled (should be true)
SELECT tablename, relrowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.tablename = 'families' AND t.schemaname = 'public';
