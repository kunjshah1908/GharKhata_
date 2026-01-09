-- Create enum for family roles
CREATE TYPE public.family_role AS ENUM ('financial_manager', 'member');

-- Create families table
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  month_start_day INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_members table (profiles within families)
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role family_role NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Create user_profiles table (for auth users)
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, category)
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  deadline DATE,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goal_contributions table
CREATE TABLE public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT '#FBBF24',
  attached_to_date DATE,
  attached_to_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  attached_to_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create obligations table (EMIs, rent, subscriptions)
CREATE TABLE public.obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  category TEXT NOT NULL CHECK (category IN ('emi', 'rent', 'subscription', 'insurance', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is member of family
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND family_id = _family_id
  )
$$;

-- Helper function to check if user is financial manager of family
CREATE OR REPLACE FUNCTION public.is_financial_manager(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND family_id = _family_id AND role = 'financial_manager'
  )
$$;

-- RLS Policies for families
CREATE POLICY "Users can view families they belong to"
ON public.families FOR SELECT
USING (public.is_family_member(auth.uid(), id));

CREATE POLICY "Users can create families"
ON public.families FOR INSERT
WITH CHECK (true);

CREATE POLICY "Financial managers can update their families"
ON public.families FOR UPDATE
USING (public.is_financial_manager(auth.uid(), id));

CREATE POLICY "Financial managers can delete their families"
ON public.families FOR DELETE
USING (public.is_financial_manager(auth.uid(), id));

-- RLS Policies for family_members
CREATE POLICY "Users can view members of their families"
ON public.family_members FOR SELECT
USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Financial managers can add members"
ON public.family_members FOR INSERT
WITH CHECK (public.is_financial_manager(auth.uid(), family_id) OR NOT EXISTS (SELECT 1 FROM public.family_members WHERE family_id = family_members.family_id));

CREATE POLICY "Financial managers can update members"
ON public.family_members FOR UPDATE
USING (public.is_financial_manager(auth.uid(), family_id) OR user_id = auth.uid());

CREATE POLICY "Financial managers can delete members"
ON public.family_members FOR DELETE
USING (public.is_financial_manager(auth.uid(), family_id));

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for transactions
CREATE POLICY "Users can view transactions of their families"
ON public.transactions FOR SELECT
USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Members can create transactions"
ON public.transactions FOR INSERT
WITH CHECK (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Members can update own transactions, managers can update all"
ON public.transactions FOR UPDATE
USING (
  public.is_financial_manager(auth.uid(), family_id) OR
  member_id IN (SELECT id FROM public.family_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can delete own transactions, managers can delete all"
ON public.transactions FOR DELETE
USING (
  public.is_financial_manager(auth.uid(), family_id) OR
  member_id IN (SELECT id FROM public.family_members WHERE user_id = auth.uid())
);

-- RLS Policies for budgets
CREATE POLICY "Users can view budgets of their families"
ON public.budgets FOR SELECT
USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Financial managers can manage budgets"
ON public.budgets FOR INSERT
WITH CHECK (public.is_financial_manager(auth.uid(), family_id));

CREATE POLICY "Financial managers can update budgets"
ON public.budgets FOR UPDATE
USING (public.is_financial_manager(auth.uid(), family_id));

CREATE POLICY "Financial managers can delete budgets"
ON public.budgets FOR DELETE
USING (public.is_financial_manager(auth.uid(), family_id));

-- RLS Policies for goals
CREATE POLICY "Users can view goals of their families"
ON public.goals FOR SELECT
USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Financial managers can manage goals"
ON public.goals FOR INSERT
WITH CHECK (public.is_financial_manager(auth.uid(), family_id));

CREATE POLICY "Financial managers can update goals"
ON public.goals FOR UPDATE
USING (public.is_financial_manager(auth.uid(), family_id));

CREATE POLICY "Financial managers can delete goals"
ON public.goals FOR DELETE
USING (public.is_financial_manager(auth.uid(), family_id));

-- RLS Policies for goal_contributions
CREATE POLICY "Users can view contributions of their families"
ON public.goal_contributions FOR SELECT
USING (goal_id IN (SELECT id FROM public.goals WHERE public.is_family_member(auth.uid(), family_id)));

CREATE POLICY "Members can add contributions"
ON public.goal_contributions FOR INSERT
WITH CHECK (goal_id IN (SELECT id FROM public.goals WHERE public.is_family_member(auth.uid(), family_id)));

-- RLS Policies for notes
CREATE POLICY "Users can view notes of their families"
ON public.notes FOR SELECT
USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Members can create notes"
ON public.notes FOR INSERT
WITH CHECK (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Members can update own notes, managers can update all"
ON public.notes FOR UPDATE
USING (
  public.is_financial_manager(auth.uid(), family_id) OR
  member_id IN (SELECT id FROM public.family_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can delete own notes, managers can delete all"
ON public.notes FOR DELETE
USING (
  public.is_financial_manager(auth.uid(), family_id) OR
  member_id IN (SELECT id FROM public.family_members WHERE user_id = auth.uid())
);

-- RLS Policies for obligations
CREATE POLICY "Users can view obligations of their families"
ON public.obligations FOR SELECT
USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Financial managers can manage obligations"
ON public.obligations FOR INSERT
WITH CHECK (public.is_financial_manager(auth.uid(), family_id));

CREATE POLICY "Financial managers can update obligations"
ON public.obligations FOR UPDATE
USING (public.is_financial_manager(auth.uid(), family_id));

CREATE POLICY "Financial managers can delete obligations"
ON public.obligations FOR DELETE
USING (public.is_financial_manager(auth.uid(), family_id));

-- Trigger for auto-creating user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_obligations_updated_at BEFORE UPDATE ON public.obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();