"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fakeAuth } from "@/lib/auth/fakeAuth";

type FormValues = { otp: string };

export default function VerifyOtpPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>();

  function onSubmit(values: FormValues) {
    const success = fakeAuth.verifyOtp(values.otp);

    if (success) {
      router.push("/dashboard");
    } else {
      alert("Invalid OTP");
    }
  }

  return (
    <main className="bg-gradient-soft min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <GlassCard>
          <h2 className="text-center text-xl font-semibold">Enter OTP</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input placeholder="Enter OTP" {...register("otp")} />
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </form>
        </GlassCard>
      </div>
    </main>
  );
}