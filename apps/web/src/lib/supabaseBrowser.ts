import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let supabaseInstance: SupabaseClient | null = null;

export const supabaseBrowser = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing");
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
};

