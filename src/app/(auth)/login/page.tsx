"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { fakeAuth } from "../../../lib/auth/fakeAuth";

type FormValues = { email: string };

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>();

  function onSubmit(values: FormValues) {
    fakeAuth.login(values.email);
    router.push("/verify-otp");
  }

  return (
    <main className="bg-gradient-soft min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-lg">
        <GlassCard className="p-10">
          <h2 className="text-3xl font-semibold text-center">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6">
            <input
              {...register("email")}
              placeholder="Enter email"
              className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            />

            <button
              type="submit"
              className="py-4 rounded-xl bg-white text-black font-semibold"
            >
              Send OTP
            </button>
          </form>

          <div className="mt-6 text-center text-white/60">
            New here?{" "}
            <span
              className="underline cursor-pointer"
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