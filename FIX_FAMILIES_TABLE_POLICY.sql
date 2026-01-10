-- FIX FAMILIES TABLE RLS POLICY
-- The families table is blocking INSERT because the policy requires the user to already be a financial manager
-- But they can't be a manager without a family existing first!

-- STEP 1: Check current INSERT policy on families table
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'families' AND cmd = 'INSERT';

-- STEP 2: Drop the restrictive policy
DROP POLICY IF EXISTS "Users can create families" ON public.families;
DROP POLICY IF EXISTS "Financial managers can manage families" ON public.families;

-- STEP 3: Create a simple INSERT policy that allows authenticated users to create families
CREATE POLICY "Authenticated users can create families"
ON public.families FOR INSERT
WITH CHECK (
  -- Any authenticated user can create a family
  auth.uid() IS NOT NULL
);

-- STEP 4: Verify the new policy
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'families' AND cmd = 'INSERT';
-- Should show: "Authenticated users can create families" with check: (auth.uid() IS NOT NULL)
