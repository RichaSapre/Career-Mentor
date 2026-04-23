"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { shouldEnableLocalAuthBypass, tokenStore } from "@/lib/auth/tokenStore";
import { toast } from "sonner";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

const LOGIN_EMAIL_KEY = "cm_login_email";

type FormValues = { otp: string };

export default function VerifyOtpPage() {
  const router = useRouter();
  const canBypassOtp = shouldEnableLocalAuthBypass();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { register, handleSubmit } = useForm<FormValues>();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(LOGIN_EMAIL_KEY)
        : null;
    if (!stored) {
      router.replace("/login");
    } else {
      setEmail(stored);
    }
  }, [router]);

  async function handleResend() {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    try {
      await apiFetch<{ ok?: boolean }>(API.loginSendOtp, {
        method: "POST",
        body: JSON.stringify({ email }),
        auth: false,
      });
      toast.success("A new OTP has been sent to your email!");
      setCooldown(60);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!email) return;

    setIsLoading(true);

    try {
      const res = await apiFetch<any>(API.verifyLoginOtp, {
        method: "POST",
        body: JSON.stringify({ email, otp: values.otp }),
        auth: false,
      });

      const tokens = res?.tokens ?? res?.data ?? res;
      const accessToken = tokens?.accessToken ?? res?.accessToken;
      const refreshToken = tokens?.refreshToken ?? res?.refreshToken;

      if (accessToken && refreshToken) {
        tokenStore.set({ accessToken, refreshToken });
        localStorage.removeItem(LOGIN_EMAIL_KEY);
        toast.success("Successfully verified! Redirecting...");
        router.push("/jobs");
      } else {
        toast.error("Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!email) return null;

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <GlassCard className="p-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-badge-success-bg border border-badge-success-border">
              <ShieldCheck className="w-7 h-7 text-badge-success-text" />
            </div>
            <h1 className="text-2xl font-bold text-heading tracking-tight">
              Enter Verification Code
            </h1>
            <p className="text-sm text-muted text-center">
              We sent a code to{" "}
              <span className="font-medium text-heading">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder placeholder:tracking-normal placeholder:text-sm placeholder:font-sans focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary"
              {...register("otp", {
                required: "OTP is required",
                minLength: { value: 4, message: "Enter a valid OTP" },
              })}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            {canBypassOtp && (
              <Button
                type="button"
                variant="secondary"
                className="w-full h-11 rounded-xl"
                onClick={() => {
                  tokenStore.setLocalDevSession();
                  localStorage.removeItem(LOGIN_EMAIL_KEY);
                  toast.success("Local dev session started.");
                  router.push("/jobs");
                }}
              >
                Continue Locally (Skip OTP)
              </Button>
            )}
          </form>

          <div className="mt-6 flex flex-col gap-4 text-center text-sm">
            <div className="text-muted">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="font-medium text-accent-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isResending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend code"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 text-muted hover:text-accent-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Use a different email
            </button>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}