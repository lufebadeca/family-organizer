import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Task = Tables<"tasks">;

export interface TaskFilters {
  status?: "pending" | "done" | "all";
  categoryId?: string | null;
  assigneeId?: string | null;
}

const BASE_KEY = ["tasks"] as const;

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: [...BASE_KEY, filters],
    queryFn: async () => {
      let q = supabase
        .from("tasks")
        .select("*")
        .order("status", { ascending: true })
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (filters.status && filters.status !== "all") {
        q = q.eq("status", filters.status);
      }
      if (filters.categoryId !== undefined) {
        q =
          filters.categoryId === null
            ? q.is("category_id", null)
            : q.eq("category_id", filters.categoryId);
      }
      if (filters.assigneeId !== undefined) {
        q =
          filters.assigneeId === null
            ? q.is("assignee_id", null)
            : q.eq("assignee_id", filters.assigneeId);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: BASE_KEY });
  qc.invalidateQueries({ queryKey: ["category-summary"] });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"tasks">) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: TablesUpdate<"tasks">;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: BASE_KEY });
      const previous = qc.getQueriesData<Task[]>({ queryKey: BASE_KEY });
      previous.forEach(([key, value]) => {
        if (!value) return;
        qc.setQueryData<Task[]>(
          key,
          value.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: () => invalidate(qc),
  });
}

export function useToggleTaskDone() {
  const update = useUpdateTask();
  return (task: Task) =>
    update.mutate({
      id: task.id,
      patch: {
        status: task.status === "done" ? "pending" : "done",
        completed_at: task.status === "done" ? null : new Date().toISOString(),
      },
    });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => invalidate(qc),
  });
}
