import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const authOptions: AuthOptions = {
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
    },
    // Upsert a canonical profile row in our `public.users` table on sign-in
    async signIn({ user, account, profile }) {
      try {
        // Run server-side upsert using service role
        const { supabaseServer } = await import('@/lib/supabaseServer')
        const supabase = supabaseServer()

        // Use email as the canonical key: select existing by email
        const email = user?.email || profile?.email
        if (email) {
          const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
          const metadata = { ...(profile || {}), provider: account?.provider }
          if (!existing) {
            await supabase.from('users').insert({ email, name: user?.name || profile?.name || null, role: 'doctor', metadata }).select()
          } else {
            await supabase.from('users').update({ name: user?.name || profile?.name || null, metadata }).eq('id', existing.id)
          }
        }
      } catch (e) {
        console.warn('Error upserting user on signIn:', e)
      }
      return true
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }