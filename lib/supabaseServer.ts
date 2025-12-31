import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabaseServer = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Service role credentials missing");
  }
  // Service role key should bypass RLS automatically
  // But we can explicitly configure it to ensure it works
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  });
};

/**
 * Create a Supabase client with user context for RLS-aware operations
 * Uses the anon key with the user's JWT token so RLS policies can evaluate auth.uid()
 * This provides defense in depth - both application code AND database enforce access
 */
export const supabaseServerWithUser = (userToken: string) => {
  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase credentials missing");
  }
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  });
};
