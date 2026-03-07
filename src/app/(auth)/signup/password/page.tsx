"use client";


import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { GlassCard } from "@/components/glass/GlassCard";
import { signupDraft } from "@/lib/auth/signupDraft";

type FormValues = {
  password: string;
  confirmPassword: string;
};

export default function PasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch } = useForm<FormValues>();

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const validations = {
    minLength: password.length >= 8,
    special: /[!@#$%^&*]/.test(password),
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword.length > 0,
  };

  function onSubmit(values: FormValues) {
  const allValid =
    validations.minLength &&
    validations.special &&
    validations.capital &&
    validations.number &&
    validations.match;

  if (!allValid) return;

  // ✅ SAVE PASSWORD TO DRAFT
  signupDraft.set({
    password: values.password,
  });

  router.push("/education");
}


  return (
    <main className="bg-gradient-soft min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-xl">
        <GlassCard className="p-12">
          <h2 className="text-4xl font-semibold text-center">Create Password</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-6">

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
                className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-sm text-white/70"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Confirm Password */}
            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm Password"
              className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            />

            {/* Validation Bullet Points */}
            <div className="text-sm space-y-2 mt-2">
              <ul className="list-disc pl-5 space-y-1">

                {!validations.minLength && (
                  <li className="text-red-400">
                    At least 8 characters
                  </li>
                )}

                {!validations.capital && (
                  <li className="text-red-400">
                    At least one uppercase letter
                  </li>
                )}

                {!validations.number && (
                  <li className="text-red-400">
                    At least one number
                  </li>
                )}

                {!validations.special && (
                  <li className="text-red-400">
                    At least one special character (!@#$%^&*)
                  </li>
                )}

                {confirmPassword.length > 0 && !validations.match && (
                  <li className="text-red-400">
                    Passwords must match
                  </li>
                )}

              </ul>

              {/* Success Indicator */}
              {validations.minLength &&
                validations.capital &&
                validations.number &&
                validations.special &&
                validations.match && (
                  <p className="text-green-400 font-medium">
                    ✓ Strong password
                  </p>
                )}
            </div>

            <button
              type="submit"
              className="mt-6 py-4 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
              disabled={
                !validations.minLength ||
                !validations.capital ||
                !validations.number ||
                !validations.special ||
                !validations.match
              }
            >
              Continue
            </button>

          </form>
        </GlassCard>
      </div>
    </main>
  );
}