import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate, Views } from "@/types/database";

export type Category = Tables<"categories">;
export type CategorySummary = Views<"v_category_summary">;

const KEY = ["categories"] as const;
const SUMMARY_KEY = ["category-summary"] as const;

export function useCategories(includeArchived = false) {
  return useQuery({
    queryKey: [...KEY, { includeArchived }],
    queryFn: async () => {
      let q = supabase.from("categories").select("*").order("created_at");
      if (!includeArchived) q = q.eq("archived", false);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCategorySummary() {
  return useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_category_summary")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: SUMMARY_KEY });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"categories">) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: TablesUpdate<"categories">;
    }) => {
      const { data, error } = await supabase
        .from("categories")
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

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => invalidate(qc),
  });
}
