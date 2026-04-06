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

export const editProfileSchema = z.object({
  fullName: z
    .string()
    .nonempty("Full name is required")
    .max(50, "Full name must be at most 50 characters"),
  bio: z.string().optional(),
  website: z.string().url("Website must be a valid URL").optional(),
  location: z.string().optional(),
  birthday: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type EditProfileForm = z.infer<typeof editProfileSchema>;
