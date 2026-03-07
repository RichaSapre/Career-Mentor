"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { signupDraft } from "@/lib/auth/signupDraft";

type FormValues = {
  fullName: string;
  email: string;
};

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  function onSubmit(values: FormValues) {
    signupDraft.set({
      full_name: values.fullName,
      email: values.email,
    });

    router.push("/signup/password");
  }

  return (
    <main className="bg-gradient-soft min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-xl">
        <GlassCard className="p-12">
          <h2 className="text-4xl font-semibold text-center">
            Create Account
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 flex flex-col gap-6"
          >
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <input
                {...register("fullName", {
                  required: "Full name is required",
                })}
                placeholder="Full Name"
                className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Email"
                className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="py-4 rounded-xl bg-white text-black font-semibold hover:opacity-90 transition"
            >
              Continue
            </button>
          </form>
        </GlassCard>
      </div>
    </main>
  );
}