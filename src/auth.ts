import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  adapter: PrismaAdapter(prisma),
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
    // Credentials({}),
  ],
} satisfies NextAuthOptions;
