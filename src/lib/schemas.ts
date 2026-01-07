import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z.email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirm: z.string().min(8, "Password must be at least 8 characters long."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

type schemaType = z.infer<typeof schema>;

export { schema, type schemaType };

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

type loginSchemaType = z.infer<typeof loginSchema>;

export { loginSchema, type loginSchemaType };
