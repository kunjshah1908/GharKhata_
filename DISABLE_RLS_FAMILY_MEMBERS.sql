-- Disable RLS on family_members table temporarily
ALTER TABLE public.family_members DISABLE ROW LEVEL SECURITY;

-- Now try creating a family again
-- It should work completely this time
