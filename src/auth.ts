import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";
import { verifyPassword } from "./lib/crypto";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 7 },
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 60 * 30,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const creds = credentials as
          | { email: string; password: string }
          | undefined;
        if (!creds?.email || !creds.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user || !user.passwordHash) return null;

        const isVerified = await verifyPassword(
          creds.password,
          user.passwordHash,
        );
        if (!isVerified) return null;

        if (!user.emailVerified) {
          throw new Error("Email not verified. Please check your inbox.");
        }

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name ?? "",
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ user, token }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
      }

      return session;
    },
  },
} satisfies NextAuthOptions;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
export const GET = handlers.get;
export const POST = handlers.post;
