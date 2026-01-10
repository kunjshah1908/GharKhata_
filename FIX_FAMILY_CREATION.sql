-- STEP 1: Check current policy
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'family_members' AND cmd = 'INSERT';

-- STEP 2: If you see the wrong policy, run this fix:
DROP POLICY IF EXISTS "Financial managers can add members" ON public.family_members;
DROP POLICY IF EXISTS "Users can add first member or managers can add more" ON public.family_members;

-- STEP 3: Create the correct policy
CREATE POLICY "Users can add first member or managers can add more"
ON public.family_members FOR INSERT
WITH CHECK (
  -- Allow if NO members exist for this family yet (first member)
  NOT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE family_id = family_members.family_id
  )
  OR
  -- OR allow if user is already a financial manager
  public.is_financial_manager(auth.uid(), family_id)
);

-- STEP 4: Verify it worked
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'family_members' AND cmd = 'INSERT';
-- Should show: "Users can add first member or managers can add more"
