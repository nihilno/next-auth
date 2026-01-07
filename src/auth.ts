import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import crypto from "crypto";
import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { sendVerificationEmail } from "./lib/mail";
import { verifyPassword } from "./lib/utils";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 7 },
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        from: process.env.EMAIL_FROM,
      },
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

        if (user && !user.emailVerified) {
          // Create verification token
          const token = crypto.randomBytes(32).toString("hex");
          const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins;

          await prisma.verificationToken.create({
            data: { identifier: user.email!, token, expires },
          });

          // Create verification links
          const base = process.env.NEXTAUTH_URL!;
          // values encoded to uri
          const link = `${base}/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email!)}`;

          await sendVerificationEmail(user.email!, link);
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
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
