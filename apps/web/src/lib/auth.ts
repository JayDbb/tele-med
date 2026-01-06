import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { NextRequest } from "next/server"
import { supabaseServer } from "./supabaseServer"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events"
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
      }
      return session
    }
  }
}

export async function requireUser(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return { userId: null, error: "Missing Authorization header" };
  }

  const token = authorization.replace("Bearer ", "");
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { userId: null, error: error?.message ?? "Unauthorized" };
  }

  return { userId: data.user.id, error: null };
}