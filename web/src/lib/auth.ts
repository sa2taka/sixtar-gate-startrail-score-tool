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
    }),
  ],
  callbacks: {
    redirect: async ({ baseUrl }) => {
      return baseUrl;
    },
  },
  // NOTE: ref: https://next-auth.js.org/configuration/nextjs#caveats
  session: {
    strategy: "jwt",
  },
  secret: process.env.SESSION_SECRET,
});
