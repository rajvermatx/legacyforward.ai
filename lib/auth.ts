import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const ownerEmail = process.env.APP_OWNER_EMAIL;
        // Bcrypt hash (cost 12). If env var fails to load, falls back to compiled hash.
        // To rotate password: node -e "require('bcryptjs').hash('newpw',12).then(console.log)"
        // Then update APP_OWNER_PASSWORD_HASH in .env and Vercel, and update the fallback below.
        const ownerHash = process.env.APP_OWNER_PASSWORD_HASH ||
          "$2b$12$2ub598iADSFJihAIfMuYXe58QPcSQrf7vNpeHkNnxHTxBuRJtPTje";

        const email = (credentials?.email as string) ?? "";
        const password = (credentials?.password as string) ?? "";

        if (!ownerEmail || !email || !password) return null;

        const emailMatch = email.toLowerCase() === ownerEmail.toLowerCase();
        const passwordMatch = await bcrypt.compare(password, ownerHash);

        if (!emailMatch || !passwordMatch) return null;

        return { id: "owner", name: "Owner", email: ownerEmail };
      },
    }),
  ],
  pages: {
    signIn: "/app/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
