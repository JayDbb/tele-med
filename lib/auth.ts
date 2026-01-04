import { NextRequest } from "next/server";
import { supabaseServer } from "./supabaseServer";

export async function requireUser(req: NextRequest) {
  // Accept Authorization header OR cookie-set token fallback
  const authorization = req.headers.get("authorization");
  const cookieToken = req.cookies.get('sb-access-token')?.value

  const token = authorization ? authorization.replace("Bearer ", "") : cookieToken
  if (!token) {
    return { userId: null, error: "Missing Authorization header or session cookie" };
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { userId: null, error: error?.message ?? "Unauthorized" };
  }

  return { userId: data.user.id, error: null };
}

