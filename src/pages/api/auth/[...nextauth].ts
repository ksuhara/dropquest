import NextAuth from 'next-auth'
// import GitHubProvider from 'next-auth/providers/github'
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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }

      return token
    },
    //セッションがチェックされた時に呼ばれる
    async session({ session, token, user }) {
      session.accessToken = token.accessToken

      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
