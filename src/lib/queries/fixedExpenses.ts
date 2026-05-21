import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import type { YearMonth } from "@/lib/dates";

export type FixedExpense = Tables<"fixed_expenses">;
export type FixedExpensePayment = Tables<"fixed_expense_payments">;

export interface FixedExpenseWithPayment {
  expense: FixedExpense;
  payment: FixedExpensePayment | null;
}

const BASE_KEY = ["fixed-expenses"] as const;

export function useFixedExpenses() {
  return useQuery({
    queryKey: BASE_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixed_expenses")
        .select("*")
        .order("payment_day", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFixedExpensesForMonth({ year, month }: YearMonth) {
  return useQuery({
    queryKey: [...BASE_KEY, "month", year, month],
    queryFn: async () => {
      const [{ data: expenses, error: e1 }, { data: payments, error: e2 }] =
        await Promise.all([
          supabase
            .from("fixed_expenses")
            .select("*")
            .eq("active", true)
            .order("payment_day", { ascending: true }),
          supabase
            .from("fixed_expense_payments")
            .select("*")
            .eq("year", year)
            .eq("month", month),
        ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const paymentMap = new Map(
        (payments ?? []).map((p) => [p.fixed_expense_id, p]),
      );
      return (expenses ?? []).map((expense) => ({
        expense,
        payment: paymentMap.get(expense.id) ?? null,
      })) as FixedExpenseWithPayment[];
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: BASE_KEY });
  qc.invalidateQueries({ queryKey: ["month-summary"] });
  qc.invalidateQueries({ queryKey: ["category-summary"] });
}

export function useCreateFixedExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"fixed_expenses">) => {
      const { data, error } = await supabase
        .from("fixed_expenses")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateFixedExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: TablesUpdate<"fixed_expenses">;
    }) => {
      const { data, error } = await supabase
        .from("fixed_expenses")
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

export function useDeleteFixedExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fixed_expenses")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useTogglePayment(period: YearMonth) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fixedExpenseId,
      paid,
      amountCop,
    }: {
      fixedExpenseId: string;
      paid: boolean;
      amountCop: number;
    }) => {
      const payload = {
        fixed_expense_id: fixedExpenseId,
        year: period.year,
        month: period.month,
        paid,
        paid_at: paid ? new Date().toISOString() : null,
        paid_amount_cop: paid ? amountCop : null,
      };
      const { data, error } = await supabase
        .from("fixed_expense_payments")
        .upsert(payload, { onConflict: "fixed_expense_id,year,month" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}
