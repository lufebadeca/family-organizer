import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import { yearMonthStart, type YearMonth } from "@/lib/dates";

export type OneTimeExpense = Tables<"one_time_expenses">;

export interface OneTimeExpenseFilters {
  categoryId?: string | null;
  status?: "planned" | "purchased" | "all";
  period?: YearMonth;
  fromPeriod?: YearMonth;
  fromDate?: string;
}

const BASE_KEY = ["one-time-expenses"] as const;

export function useOneTimeExpenses(filters: OneTimeExpenseFilters = {}) {
  return useQuery({
    queryKey: [...BASE_KEY, filters],
    queryFn: async () => {
      let q = supabase
        .from("one_time_expenses")
        .select("*")
        .order("expense_date", { ascending: false });
      if (filters.categoryId !== undefined) {
        q =
          filters.categoryId === null
            ? q.is("category_id", null)
            : q.eq("category_id", filters.categoryId);
      }
      if (filters.status && filters.status !== "all") {
        q = q.eq("status", filters.status);
      }
      if (filters.period) {
        const { year, month } = filters.period;
        const start = yearMonthStart({ year, month });
        const endMonth = month === 12 ? 1 : month + 1;
        const endYear = month === 12 ? year + 1 : year;
        const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
        q = q.gte("expense_date", start).lt("expense_date", end);
      } else if (filters.fromPeriod) {
        q = q.gte("expense_date", yearMonthStart(filters.fromPeriod));
      }
      if (filters.fromDate) {
        q = q.gte("expense_date", filters.fromDate);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: BASE_KEY });
  qc.invalidateQueries({ queryKey: ["month-summary"] });
  qc.invalidateQueries({ queryKey: ["category-summary"] });
}

export function useCreateOneTimeExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"one_time_expenses">) => {
      const { data, error } = await supabase
        .from("one_time_expenses")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateOneTimeExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: TablesUpdate<"one_time_expenses">;
    }) => {
      const { data, error } = await supabase
        .from("one_time_expenses")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteOneTimeExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("one_time_expenses")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => invalidate(qc),
  });
}
