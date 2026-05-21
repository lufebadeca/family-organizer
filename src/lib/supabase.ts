import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[supabase] Faltan variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient<Database>(url ?? "", anonKey ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});
