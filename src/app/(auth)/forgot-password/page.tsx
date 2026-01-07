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
import { ResetPassword } from "@/lib/actions/auth";
import { forgotSchema, forgotSchemaType } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const form = useForm<forgotSchemaType>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(formData: forgotSchemaType) {
    const { success, message } = await ResetPassword(formData);
    if (success) {
      toast.success(message);
      form.reset();
    } else {
      toast.info(message);
    }
    console.log(formData);
  }

  return (
    <>
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

          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            className="mt-2"
          >
            {form.formState.isSubmitting ? "Resseting..." : "Reset password"}
          </Button>
        </form>
      </Form>

      <Link className="mt-4 text-sm" href={"/signin"}>
        Go back
      </Link>
    </>
  );
}
