import NextAuth from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0'
    })
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token
      }

      return token
    },

    async session({ session, token }: any) {
      session.accessToken = token.accessToken

      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
