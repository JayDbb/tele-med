import { NextRequest } from "next/server";
import { supabaseServer } from "./supabaseServer";

export async function requireUser(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return { userId: null, user: null, token: null, error: "Missing Authorization header" };
  }

  const token = authorization.replace("Bearer ", "");
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { userId: null, user: null, token: null, error: error?.message ?? "Unauthorized" };
  }

  return { userId: data.user.id, user: data.user, token, error: null };
}

