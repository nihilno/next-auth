import SetPassword from "@/components/set-password";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GetTokenPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  const invalid = !tokenRecord;
  const expired = tokenRecord ? tokenRecord.expiresAt < new Date() : false;
  const used = tokenRecord?.usedAt;

  if (invalid || expired || used) {
    let errorMessage = "";
    if (invalid) {
      errorMessage = "This reset link is invalid.";
    } else if (used) {
      errorMessage = "This reset link was already used.";
    } else if (expired) {
      errorMessage = "This reset link is expired.";
    }

    return (
      <section className="space-y-1 text-center text-xl">
        <h1 className="text-destructive">{errorMessage}</h1>
        <Link href={"/signin"} className="mt-2 text-sm">
          Go back
        </Link>
      </section>
    );
  }

  return <SetPassword token={token} />;
}
