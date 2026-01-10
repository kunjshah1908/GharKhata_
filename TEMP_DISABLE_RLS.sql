-- TEMPORARY TEST: Disable RLS on families table
-- This is just to confirm RLS is the problem
-- We'll re-enable it after testing

ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;

-- Try creating a family now in your app
-- If it works, we know it's a policy issue
-- Then run the next command to re-enable it:

-- ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
