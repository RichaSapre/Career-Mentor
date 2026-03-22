"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

const LOGIN_EMAIL_KEY = "cm_login_email";

type FormValues = { email: string };

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      await apiFetch<{ ok?: boolean }>(API.loginSendOtp, {
        method: "POST",
        body: JSON.stringify({ email: values.email }),
        auth: false,
      });

      localStorage.setItem(LOGIN_EMAIL_KEY, values.email);
      toast.success("OTP sent to your email!");
      router.push("/verify-otp");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <GlassCard className="p-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-badge-info-bg border border-badge-info-border">
              <Mail className="w-7 h-7 text-badge-info-text" />
            </div>
            <h1 className="text-3xl font-bold text-heading tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-muted text-center">
              We&apos;ll send a one-time code to your registered email
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email" className="text-sm font-medium text-body">
                Email Address
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@university.edu"
                className="h-12 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP…
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-sm text-muted">
            New here?{" "}
            <button
              type="button"
              className="underline cursor-pointer text-accent-primary hover:opacity-80 transition-opacity font-medium"
              onClick={() => router.push("/signup")}
            >
              Create an account
            </button>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}