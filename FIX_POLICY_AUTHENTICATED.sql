-- FINAL FIX: The issue is that WITH CHECK (true) might not work with anon key
-- We need to explicitly check for authenticated users

-- Step 1: Drop the current policy
DROP POLICY IF EXISTS "Users can create families" ON public.families;

-- Step 2: Create policy that explicitly checks for authenticated role
CREATE POLICY "Users can create families"
ON public.families FOR INSERT
TO authenticated  -- This restricts it to authenticated users only, not anon
WITH CHECK (true);

-- Step 3: Verify
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    with_check
FROM pg_policies 
WHERE tablename = 'families' AND cmd = 'INSERT';

-- Should show: roles = {authenticated}
