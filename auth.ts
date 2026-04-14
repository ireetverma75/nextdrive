import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./lib/db";
import { users } from "./lib/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { email, password } = credentials;
        const userSet = await db.select().from(users).where(eq(users.email, email as string));
        const user = userSet[0];
        if (!user) throw new Error("User not found");
        const isValid = await bcrypt.compare(password as string, user.password);
        if (!isValid) throw new Error("Invalid credentials");
        return { id: user.id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
