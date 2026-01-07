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
import { Login } from "@/lib/actions/auth";
import { loginSchema, loginSchemaType } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { replace } = useRouter();

  const form = useForm<loginSchemaType>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(formData: loginSchemaType) {
    const { success, message } = await Login(formData);
    if (success) {
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

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="mt-2"
        >
          {form.formState.isSubmitting ? "Loggin in..." : "Login"}
        </Button>
      </form>

      <div className="mt-4 flex gap-1 text-sm">
        <p>Dont have an account?</p>
        <Link className="underline" href={"/signup"}>
          Register
        </Link>
      </div>
    </Form>
  );
}
