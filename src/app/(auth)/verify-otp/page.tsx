"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { tokenStore } from "@/lib/auth/tokenStore";
const LOGIN_EMAIL_KEY = "cm_login_email";

type FormValues = { otp: string };

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<FormValues>();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(LOGIN_EMAIL_KEY) : null;
    if (!stored) {
      router.replace("/login");
    } else {
      setEmail(stored);
    }
  }, [router]);

  async function onSubmit(values: FormValues) {
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiFetch<any>(API.verifyLoginOtp, {
        method: "POST",
        body: JSON.stringify({ email, otp: values.otp }),
        auth: false,
      });

      // Handle various response formats: { accessToken, refreshToken } | { tokens } | { data }
      const tokens = res?.tokens ?? res?.data ?? res;
      const accessToken = tokens?.accessToken ?? res?.accessToken;
      const refreshToken = tokens?.refreshToken ?? res?.refreshToken;

      if (accessToken && refreshToken) {
        tokenStore.set({ accessToken, refreshToken });
        localStorage.removeItem(LOGIN_EMAIL_KEY);
        router.push("/dashboard");
      } else {
        setError("Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!email) return null;

  return (
    <main className="bg-gradient-soft min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <GlassCard>
          <h2 className="text-center text-xl font-semibold text-heading">Enter OTP</h2>
          <p className="text-center text-sm text-muted mt-1">
            Check your email for the code sent to {email}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              {...register("otp", {
                required: "OTP is required",
                minLength: { value: 4, message: "Enter a valid OTP" },
              })}
            />
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 w-full text-center text-sm text-muted hover:text-accent-primary transition-colors"
          >
            Use a different email
          </button>
        </GlassCard>
      </div>
    </main>
  );
}