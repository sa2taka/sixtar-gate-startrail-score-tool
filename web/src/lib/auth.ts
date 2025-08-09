import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    redirect: async ({ baseUrl }) => {
      return baseUrl;
    },
    session: async ({ session, token }) => {
      session.user.id = token.sub ?? "";
      return session;
    },
  },
  // NOTE: ref: https://next-auth.js.org/configuration/nextjs#caveats
  session: {
    strategy: "jwt",
  },
  secret: process.env.SESSION_SECRET,
});
