import { Button } from "@/components/ui/button";
import { doVerify } from "@/lib/actions/auth";
import Link from "next/link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";
  const token = params.token ?? "";

  if (!email || !token)
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl">Invalid link</h1>
        <Button>
          <Link href={"/signin"}>Back to sing in</Link>
        </Button>
      </div>
    );

  const result = await doVerify(email, token);

  return (
    <div className="text-center">
      {result.success ? (
        <div className="space-y-4">
          <h1>Email verified</h1>
          <Button>
            <Link href={"/signin"}>Continue to sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <h1>Verification failed</h1>
          <Button>
            <Link href={"/signin"}>Back to sing in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
