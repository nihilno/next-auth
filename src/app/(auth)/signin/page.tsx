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
import {
  loginSchema,
  loginSchemaType,
  magicSchema,
  magicSchemaType,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  const { replace } = useRouter();

  const form = useForm<loginSchemaType>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const magicForm = useForm<magicSchemaType>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(magicSchema),
  });

  const isSubmitting =
    form.formState.isSubmitting || magicForm.formState.isSubmitting;

  async function onSubmit(formData: loginSchemaType) {
    const { success, message } = await Login(formData);
    if (success) {
      replace("/dashboard");
    } else {
      toast.info(message);
    }
  }

  async function onMagic(formData: magicSchemaType) {
    try {
      const response = await signIn("nodemailer", {
        email: formData.email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (response.ok) {
        toast.success("Check your inbox for sing-in link.");
        magicForm.reset();
      }
    } catch (error) {
      console.error(error);
      toast.info("Error occured while sending a Magic Link.");
    }
  }

  async function signInGoogle() {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error(error);
      toast.info("Error occured while logging in with Google.");
    }
  }

  return (
    <>
      {!showMagicLink ? (
        <Form {...form} key={"credentials-form"}>
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

            <Button disabled={isSubmitting} type="submit" className="mt-2">
              {form.formState.isSubmitting ? "Loggin in..." : "Login"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...magicForm} key={"magic-form"}>
          <form
            className="flex w-full max-w-sm flex-col gap-4"
            onSubmit={magicForm.handleSubmit(onMagic)}
          >
            <FormField
              control={magicForm.control}
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

            <Button disabled={isSubmitting} type="submit" className="mt-2">
              {magicForm.formState.isSubmitting
                ? "Sending..."
                : "Send me a link"}
            </Button>
          </form>
        </Form>
      )}

      {/* google oauth + magic link */}

      <div className="mt-4 text-center">
        <h4 className="text-sm">Or try with</h4>
        <div className="mt-2 space-x-4">
          <Button
            type="button"
            variant={"outline"}
            size={"icon"}
            onClick={signInGoogle}
            className="w-25"
            disabled={isSubmitting}
          >
            <span>Google</span>
          </Button>
          {showMagicLink ? (
            <>
              <Button
                type="button"
                variant={"outline"}
                size={"icon"}
                onClick={() => setShowMagicLink(false)}
                className="w-25"
                disabled={isSubmitting}
              >
                <span>Credentials</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant={"outline"}
              size={"icon"}
              onClick={() => setShowMagicLink(true)}
              className="w-25"
              disabled={isSubmitting}
            >
              <span>Magic Link</span>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 text-sm">
        <div className="flex gap-1">
          <p>Don&apos;t have an account?</p>{" "}
          <Link className="underline" href={"/signup"}>
            Register
          </Link>
        </div>
        <div className="flex gap-1">
          <Link className="underline" href={"/forgot-password"}>
            Forgot your password?
          </Link>
        </div>
      </div>
    </>
  );
}
