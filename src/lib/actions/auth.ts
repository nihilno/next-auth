"use server";

import { signIn } from "@/auth";
import { sendResetEmail, sendVerificationEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { forgotSchema, loginSchema, resetSchema, schema } from "@/lib/schemas";
import { hashPassword } from "@/lib/utils";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

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

export async function doVerify(email: string, token: string) {
  const vt = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  if (!vt || vt.identifier !== email || vt.expires < new Date()) {
    return { success: false, message: "Invalid or expired token." };
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  return { success: true, message: "Success." };
}

export async function Login(formData: unknown) {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue.message || "Invalid data provided";

    return {
      success: false,
      message,
    };
  }

  const { email, password } = result.data;

  try {
    if (!email || !password)
      return {
        success: false,
        message: "Missing required fields.",
      };

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response.error) {
      return {
        success: false,
        message: "Unexpected error, try again later.",
      };
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Success" };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Wrong credentials. Try again.",
    };
  }
}

export async function ResetPassword(formData: unknown) {
  const result = forgotSchema.safeParse(formData);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue.message || "Invalid data provided.";

    return {
      success: false,
      message,
    };
  }
  const { email } = result.data;

  try {
    if (!email)
      return {
        success: false,
        message: "Missing required fields.",
      };

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: true,
        message: `If an account exists for ${email}, a reset link has been sent.`,
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 mins;

    await prisma.passwordResetToken.create({
      data: { tokenHash, expiresAt, userId: user.id },
    });

    // Create verification links
    const base = process.env.NEXTAUTH_URL!;
    // values encoded to uri
    const link = `${base}/forgot-password/get?token=${encodeURIComponent(token)}`;

    await sendResetEmail(email!, link);

    return {
      success: true,
      message: `A reset link has been sent to ${email}.`,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}

export async function SetNewPassword(formData: unknown, token: string) {
  const result = resetSchema.safeParse(formData);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue.message || "Invalid data provided.";

    return {
      success: false,
      message,
    };
  }
  const { password, confirm } = result.data;

  try {
    if (!password || !confirm)
      return {
        success: false,
        message: "Missing required fields.",
      };

    const newPassword = password;
    if (!token || newPassword.length < 8)
      return {
        success: false,
        message: "Token is long gone by now. Try resetting again.",
      };

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    const invalid = !tokenRecord;
    const expired = tokenRecord ? tokenRecord.expiresAt < new Date() : false;
    const used = tokenRecord?.usedAt;
    if (invalid || expired || used) {
      return {
        success: false,
        message: "Token is long gone by now. Try resetting again.",
      };
    }

    const newHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      }),
    ]);
    return {
      success: true,
      message: "New password successfully set.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Invalid credentials. Try again.",
    };
  }
}
