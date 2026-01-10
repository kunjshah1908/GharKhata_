import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Goal {
  id: string;
  family_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  member_id: string | null;
  amount: number;
  date: string;
  created_at: string;
}

export interface CreateGoalInput {
  name: string;
  target_amount: number;
  deadline?: string;
  color?: string;
}

/**
 * Fetch all goals for a family
 * ADAPTED FOR YOUR PROJECT: Replace familyId with your currentFamily.id
 */
export const useGoals = (familyId: string | null) => {
  return useQuery({
    queryKey: ["goals", familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!familyId,
  });
};

/**
 * Fetch contributions for a specific goal
 * ADAPTED FOR YOUR PROJECT: Pass the goal id
 */
export const useGoalContributions = (goalId: string | null) => {
  return useQuery({
    queryKey: ["goal_contributions", goalId],
    queryFn: async () => {
      if (!goalId) return [];

      const { data, error } = await supabase
        .from("goal_contributions")
        .select("*")
        .eq("goal_id", goalId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as GoalContribution[];
    },
    enabled: !!goalId,
  });
};

/**
 * Create a new goal
 * ADAPTED FOR YOUR PROJECT: Pass familyId from useFamily().currentFamily.id
 */
export const useCreateGoal = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      if (!familyId) throw new Error("Family not selected");

      const { data, error } = await supabase
        .from("goals")
        .insert({
          family_id: familyId,
          name: input.name,
          target_amount: input.target_amount,
          current_amount: 0,
          deadline: input.deadline || null,
          color: input.color || "#10B981",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

/**
 * Add a contribution to a goal
 * ADAPTED FOR YOUR PROJECT: Pass goalId and memberId from useFamily().currentMember.id
 */
export const useAddGoalContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      amount,
      date,
    }: {
      goalId: string;
      amount: number;
      date: string;
    }) => {
      // Get goal to fetch family_id and current amount
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single();

      if (goalError) throw goalError;
      if (!goal) throw new Error("Goal not found");

      // Create contribution
      const { data: contribution, error: contribError } = await supabase
        .from("goal_contributions")
        .insert({
          goal_id: goalId,
          amount,
          date,
        })
        .select()
        .single();

      if (contribError) throw contribError;

      // Update goal's current amount
      const newAmount = goal.current_amount + amount;
      const { error: updateError } = await supabase
        .from("goals")
        .update({ current_amount: newAmount })
        .eq("id", goalId);

      if (updateError) throw updateError;

      return contribution as GoalContribution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal_contributions"] });
    },
  });
};

/**
 * Update a goal
 * ADAPTED FOR YOUR PROJECT: Pass the goal id and updated fields
 */
export const useUpdateGoal = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Goal> & { id: string }) => {
      if (!familyId) throw new Error("Family not selected");

      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .eq("family_id", familyId)
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

/**
 * Delete a goal
 * ADAPTED FOR YOUR PROJECT: Pass the goal id to delete
 */
export const useDeleteGoal = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!familyId) throw new Error("Family not selected");

      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id)
        .eq("family_id", familyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};
