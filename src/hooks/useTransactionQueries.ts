import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  family_id: string;
  member_id: string | null;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  is_recurring: boolean;
  recurring_frequency: "daily" | "weekly" | "monthly" | "yearly" | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
  date: string;
  is_recurring?: boolean;
  recurring_frequency?: "daily" | "weekly" | "monthly" | "yearly";
}

/**
 * Fetch all transactions for a family
 * ADAPTED FOR YOUR PROJECT: Replace familyId with your currentFamily.id
 */
export const useTransactions = (familyId: string | null) => {
  return useQuery({
    queryKey: ["transactions", familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("family_id", familyId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!familyId,
  });
};

/**
 * Fetch transactions for a specific month and year
 * ADAPTED FOR YOUR PROJECT: Pass in the month and year from your selected month state
 */
export const useTransactionsByMonth = (
  familyId: string | null,
  month: number,
  year: number
) => {
  return useQuery({
    queryKey: ["transactions", familyId, month, year],
    queryFn: async () => {
      if (!familyId) return [];

      // Get start and end dates for the month
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("family_id", familyId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!familyId,
  });
};

/**
 * Create a new transaction
 * ADAPTED FOR YOUR PROJECT: Pass familyId from useFamily().currentFamily.id
 * and memberId from useFamily().currentMember.id
 */
export const useCreateTransaction = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      if (!familyId) throw new Error("Family not selected");

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          family_id: familyId,
          type: input.type,
          category: input.category,
          amount: input.amount,
          description: input.description || null,
          date: input.date,
          is_recurring: input.is_recurring || false,
          recurring_frequency: input.recurring_frequency || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

/**
 * Update an existing transaction
 * ADAPTED FOR YOUR PROJECT: Pass the transaction id and updated fields
 */
export const useUpdateTransaction = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Transaction> & { id: string }) => {
      if (!familyId) throw new Error("Family not selected");

      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .eq("family_id", familyId)
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

/**
 * Delete a transaction
 * ADAPTED FOR YOUR PROJECT: Pass the transaction id to delete
 */
export const useDeleteTransaction = (familyId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!familyId) throw new Error("Family not selected");

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("family_id", familyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
