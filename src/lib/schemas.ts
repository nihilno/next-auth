import { z } from "zod";

// register

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

// login

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

type loginSchemaType = z.infer<typeof loginSchema>;

export { loginSchema, type loginSchemaType };

// forgot password

const forgotSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type forgotSchemaType = z.infer<typeof forgotSchema>;

export { forgotSchema, type forgotSchemaType };

// reset password

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirm: z.string().min(8, "Password must be at least 8 characters long."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

type resetSchemaType = z.infer<typeof resetSchema>;

export { resetSchema, type resetSchemaType };

// magic

const magicSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type magicSchemaType = z.infer<typeof magicSchema>;

export { magicSchema, type magicSchemaType };
