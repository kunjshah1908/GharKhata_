import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Budget {
  id: string;
  family_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  category: string;
  monthly_limit: number;
}

/**
 * Fetch all budgets for a family
 * ADAPTED FOR YOUR PROJECT: Replace familyId with your currentFamily.id
 */
export const useBudgets = (familyId: string | null) => {
  return useQuery({
    queryKey: ["budgets", familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("family_id", familyId)
        .order("category", { ascending: true });

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!familyId,
  });
};

/**
 * Create or update a budget
 * ADAPTED FOR YOUR PROJECT: Pass familyId from useFamily().currentFamily.id
 * If budget exists for category, it will be updated via upsert
 */
export const useCreateOrUpdateBudget = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      if (!familyId) throw new Error("Family not selected");

      const { data, error } = await supabase
        .from("budgets")
        .upsert(
          {
            family_id: familyId,
            category: input.category,
            monthly_limit: input.monthly_limit,
          },
          {
            onConflict: "family_id,category",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

/**
 * Delete a budget
 * ADAPTED FOR YOUR PROJECT: Pass the budget id to delete
 */
export const useDeleteBudget = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!familyId) throw new Error("Family not selected");

      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("family_id", familyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
