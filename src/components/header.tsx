import { auth, signOut } from "@/auth";
import { DoorOpen, Home, LayoutDashboard } from "lucide-react";
import Link from "next/link";

async function Header() {
  const session = await auth();
  const role = session?.user?.role;
  const image = session?.user?.image;
  const name = session?.user?.name;
  const headerStyles =
    "py-2 h-20 px-4 border-b border-dashed flex items-center justify-between";

  if (session)
    return (
      <header className={headerStyles}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold">
            <Home className="size-5" />
          </Link>
          <nav>
            <Link href={"/dashboard"} className="text-xl font-bold">
              <LayoutDashboard className="size-5" />
            </Link>
          </nav>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <button type="submit" className="grid place-items-center">
              <DoorOpen className="size-5" />
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 text-[11px]">
          <p>{name || "Unknown name"}</p>
          <p className="place-self-end pr-1.5">{role}</p>
          <p className="col-span-2">{session.user.email}</p>
        </div>

        {role === "admin" && (
          <div>
            <p className="text-yellow-500">
              Since you are {role}, you can go there
            </p>
            <Link href={"/dashboard"}>
              <LayoutDashboard className="size-5" />
            </Link>
          </div>
        )}
      </header>
    );
  return (
    <header className={headerStyles}>
      <Link href="/" className="text-xl font-bold">
        <Home className="size-5" />
      </Link>
      <h2>The session is null.</h2>
      <div className="space-x-4 text-sm">
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
