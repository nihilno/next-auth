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
import { SetNewPassword } from "@/lib/actions/auth";
import { resetSchema, resetSchemaType } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SetPassword({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const { replace } = useRouter();

  const form = useForm<resetSchemaType>({
    defaultValues: {
      password: "",
      confirm: "",
    },
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(formData: resetSchemaType) {
    const { success, message } = await SetNewPassword(formData, token);
    if (success) {
      toast.success(message);
      replace("/signin");
    } else {
      toast.info(message);
    }

    console.log(formData);
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-sm flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
                    className="text-sm"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
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

        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="text-sm"
                  placeholder="••••••••"
                  type="password"
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
          {form.formState.isSubmitting ? "Setting..." : "Set new password"}
        </Button>
      </form>
    </Form>
  );
}
