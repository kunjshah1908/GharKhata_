-- COMPLETE RESET OF FAMILIES INSERT POLICY
-- Drop ALL possible INSERT policies on families table
DROP POLICY IF EXISTS "Users can create families" ON public.families;
DROP POLICY IF EXISTS "Authenticated users can create families" ON public.families;
DROP POLICY IF EXISTS "Financial managers can manage families" ON public.families;

-- Recreate the original simple policy that allows everyone
CREATE POLICY "Users can create families"
ON public.families FOR INSERT
WITH CHECK (true);

-- Verify the policy
SELECT policyname, cmd, permissive, qual, with_check 
FROM pg_policies 
WHERE tablename = 'families' AND cmd = 'INSERT';
