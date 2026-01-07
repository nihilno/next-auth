import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

async function Header() {
  const session = await auth();
  const role = session?.user?.role;
  const image = session?.user?.image;
  const name = session?.user?.name;
  const headerStyles =
    "py-6 px-4 border-b border-dashed flex items-center justify-evenly";

  if (session)
    return (
      <header className={headerStyles}>
        <Link href="/" className="text-xl font-bold">
          H
        </Link>
        <h2>The session is</h2>
        <nav>
          <Link href={"/dashboard"}>Go to dashboard</Link>
        </nav>
        <p className="text-sm">
          Welcome <strong>{session?.user || "Unnamed"}</strong>, your role is ,
          your email is <strong>{session?.user.email || "Unknown."}</strong>
          <strong>{role || "Unknown"}</strong>.
        </p>
        <Image src={image} alt={name} width={64} height={64} />

        {role === "admin" && (
          <div>
            <p className="text-yellow-500">
              Since you are {role}, you can go there
            </p>
            <Link href={"/dashboard"}>Go to dashboard</Link>
          </div>
        )}

        <form action={() => signOut()}>
          <button type="submit" className="border px-2">
            Log Out
          </button>
        </form>
      </header>
    );
  return (
    <header className={headerStyles}>
      <Link href="/" className="text-xl font-bold">
        H
      </Link>
      <h2>The session is null.</h2>
      <div className="space-x-4">
        <button type="button" className="border px-2">
          <Link href={"/signin"}>Login</Link>
        </button>
        <button type="button" className="border px-2">
          <Link href={"/signup"}>Register</Link>
        </button>
      </div>
    </header>
  );
}

export default Header;
