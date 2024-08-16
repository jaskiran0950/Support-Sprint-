import { verifyPassword } from "@/lib/auth";
import { findUser } from "@/lib/db";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXT_PUBLIC_SECRET,
  callbacks: {
    session({ session, token }) {
      session.user.role = token.role;
      session.user.userId = token.userId;
      session.user.name = token.name;
      return session;
    },
    jwt: async ({ token, user }) => {
      const existingUser = await findUser(token.email);

      return {
        ...token,
        ...user,
        name: existingUser.name,
        userId: existingUser.id,
        role: existingUser.role,
        organization: existingUser.organization_id,
      };
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        const userDetails = await findUser(credentials.email);

        if (!userDetails) {
          throw new Error("No user found.");
        }

        const isValid = await verifyPassword(
          credentials.password,
          userDetails.password
        );

        if (!isValid) {
          throw new Error("Password does not match");
        }

        return { email: userDetails.email };
      },
    }),
  ],
};

export default NextAuth(authOptions);
