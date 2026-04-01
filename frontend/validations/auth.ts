import * as z from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "auth.register.errors.fullNameMin")
      .max(50, "auth.register.errors.fullNameMax")
      .regex(/^[\p{L}\s]+$/u, "auth.register.errors.fullNameInvalid"),

    email: z
      .string()
      .min(1, "auth.register.errors.emailRequired")
      .email("auth.register.errors.emailInvalid"),

    password: z.string().min(6, "auth.register.errors.passwordMin"),

    confirmPassword: z
      .string()
      .min(1, "auth.register.errors.confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.register.errors.passwordMismatch",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "auth.login.errors.emailRequired")
    .email("auth.login.errors.emailInvalid"),

  password: z.string().min(6, "auth.login.errors.passwordMin"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
