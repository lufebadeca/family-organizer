import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables, Views } from "@/types/database";
import { previousYearMonth, type YearMonth } from "@/lib/dates";

export type MonthlyBudget = Tables<"monthly_budgets">;
export type MonthSummary = Views<"v_month_summary">;

const BUDGET_KEY = ["monthly-budget"] as const;
const SUMMARY_KEY = ["month-summary"] as const;

export function useMonthlyBudget({ year, month }: YearMonth) {
  return useQuery({
    queryKey: [...BUDGET_KEY, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_budgets")
        .select("*")
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

export function useMonthSummary({ year, month }: YearMonth) {
  return useQuery({
    queryKey: [...SUMMARY_KEY, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_month_summary")
        .select("*")
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();
      if (error) throw error;
      return (
        data ?? {
          year,
          month,
          income_cop: 0,
          fixed_total_cop: 0,
          fixed_paid_cop: 0,
          fixed_pending_cop: 0,
          one_time_total_cop: 0,
          balance_cop: 0,
        }
      );
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: BUDGET_KEY });
  qc.invalidateQueries({ queryKey: SUMMARY_KEY });
}

export function useUpsertMonthlyBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      year,
      month,
      income_cop,
      notes,
    }: {
      year: number;
      month: number;
      income_cop: number;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("monthly_budgets")
        .upsert(
          { year, month, income_cop, notes: notes ?? null },
          { onConflict: "year,month" },
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useCopyPreviousMonthBudget() {
  const upsert = useUpsertMonthlyBudget();
  return async (current: YearMonth) => {
    const prev = previousYearMonth(current);
    const { data, error } = await supabase
      .from("monthly_budgets")
      .select("income_cop")
      .eq("year", prev.year)
      .eq("month", prev.month)
      .maybeSingle();
    if (error) throw error;
    const income = data?.income_cop ?? 0;
    return upsert.mutateAsync({
      year: current.year,
      month: current.month,
      income_cop: income,
    });
  };
}
