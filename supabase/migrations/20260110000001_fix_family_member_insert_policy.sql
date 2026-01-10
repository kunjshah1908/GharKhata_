-- Fix the RLS policy for family_members INSERT to allow first member creation
-- This fixes the circular dependency issue where a user can't create the first member
-- because is_financial_manager requires a member record to exist

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Financial managers can add members" ON public.family_members;

-- Create a better policy that allows:
-- 1. Any authenticated user to add the FIRST member to a new family (where no members exist yet)
-- 2. Financial managers to add additional members to their families
CREATE POLICY "Users can add first member or managers can add more"
ON public.family_members FOR INSERT
WITH CHECK (
  -- Allow if this is the first member of the family (no members exist yet)
  NOT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE family_id = family_members.family_id
  )
  OR
  -- OR allow if user is already a financial manager of this family
  public.is_financial_manager(auth.uid(), family_id)
);
