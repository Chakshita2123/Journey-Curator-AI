import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required when running behind a reverse proxy (Render, Vercel, etc.)
  // Without this NextAuth rejects requests whose Host header doesn't match NEXTAUTH_URL
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("journey_curator");
        const users = db.collection("users");

        const user = await users.findOne({ email: credentials.email });
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );
        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email as string,
          name: (user.name as string) ?? user.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  // NextAuth v5 uses AUTH_SECRET; fall back to NEXTAUTH_SECRET for compatibility
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});
