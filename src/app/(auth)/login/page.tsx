"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";

const LOGIN_EMAIL_KEY = "cm_login_email";

type FormValues = { email: string };

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      await apiFetch<{ ok?: boolean }>(API.loginSendOtp, {
        method: "POST",
        body: JSON.stringify({ email: values.email }),
        auth: false,
      });

      localStorage.setItem(LOGIN_EMAIL_KEY, values.email);
      router.push("/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="bg-gradient-soft min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-lg">
        <GlassCard className="p-10">
          <h2 className="text-3xl font-semibold text-center text-heading">Login</h2>
          <p className="text-center text-sm text-muted mt-2">
            We&apos;ll send a one-time code to your registered email
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6">
            <div>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email address",
                  },
                })}
                type="email"
                placeholder="Enter your registered email"
                className="px-6 py-4 rounded-xl bg-input-bg border border-input-border text-input-text placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary transition-all w-full"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="py-4 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)] disabled:opacity-60"
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <div className="mt-6 text-center text-muted">
            New here?{" "}
            <span
              className="underline cursor-pointer text-accent-primary hover:opacity-80 transition-opacity"
              onClick={() => router.push("/signup")}
            >
              Register now
            </span>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}