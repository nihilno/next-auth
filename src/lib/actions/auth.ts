"use server";

import { prisma } from "@/lib/prisma";
import { schema } from "@/lib/schemas";
import { hashPassword } from "@/lib/utils";
import crypto from "crypto";
import { sendVerificationEmail } from "../mail";

export async function Register(formData: unknown) {
  const result = schema.safeParse(formData);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue.message || "Invalid data provided";

    return {
      success: false,
      message,
    };
  }

  const { name, email, password } = result.data;

  try {
    //regular checks
    if (!email || !password)
      return {
        success: false,
        message: "Missing required fields.",
      };

    const exists = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (exists) {
      return {
        success: false,
        message: "User with this email already exists.",
      };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
    });

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
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message || "Something went wrong. Please try again later"
        : "Something went wrong. Please try again later";

    return {
      success: false,
      message,
    };
  }

  return {
    success: true,
    message: "Account created successfully! Check your email to verify.",
  };
}
