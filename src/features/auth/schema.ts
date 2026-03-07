import { z } from "zod";

export const loginEmailSchema = z.object({
  email: z.string().email(),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4, "OTP is required"),
});

export const signupBasicsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
});

export const signupPasswordSchema = z
  .object({
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
