"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Register } from "@/lib/actions/auth";
import { schema, schemaType } from "@/lib/schemas";
import { getStrengthInfo, scorePassword } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { replace } = useRouter();

  const form = useForm<schemaType>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm: "",
    },
    resolver: zodResolver(schema),
  });

  const pw = form.watch("password") || "";
  const score = useMemo(() => scorePassword(pw), [pw]);
  const strength = getStrengthInfo(score);

  async function onSubmit(formData: schemaType) {
    const { success, message } = await Register(formData);
    if (success) {
      toast.success(message);
      replace("/dashboard");
    } else {
      toast.info(message);
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-sm flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="text-sm"
                  placeholder="Jan Kowalski"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="text-sm"
                  placeholder="jan.kowalski@gmail.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    className="text-sm"
                    placeholder="••••••••"
                  />
                  <Button
                    className="absolute top-0 right-2 h-full px-3 text-xs hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {score >= 0 && (
          <div className="mt-2 space-y-3">
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                style={{
                  width: `${strength.percent}%`,
                  backgroundColor: strength.color,
                  height: "100%",
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs">
                Strength:&nbsp;{" "}
                <span style={{ color: strength.color }}>{strength.label}</span>
              </p>
              {score >= 4 && (
                <span className="text-xs text-green-500">✓ Secure</span>
              )}
            </div>

            {pw.length > 0 && (
              <ul className="text-muted-foreground my-2 grid grid-cols-2 text-xs">
                <li>{pw.length >= 8 ? "✓" : "Ｏ"} At least 8 characters.</li>
                <li>
                  {/[A-Z]/.test(pw) && /[a-z]/.test(pw) ? "✓" : "Ｏ"} Contains
                  lower & uppercase.
                </li>
                <li>{/[0-9]/.test(pw) ? "✓" : "Ｏ"} Contains a number.</li>
                <li>
                  {/[^A-Za-z0-9]/.test(pw) ? "✓" : "Ｏ"} Contains a special
                  character.
                </li>
              </ul>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  className="text-sm"
                  placeholder="••••••••"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="mt-2"
        >
          {form.formState.isSubmitting ? "Registering..." : "Register"}
        </Button>
      </form>

      <div className="mt-4 flex gap-1 text-sm">
        <p>Already have an account?</p>
        <Link className="underline" href={"/signin"}>
          Log in
        </Link>
      </div>
    </Form>
  );
}
