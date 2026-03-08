"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { educationSchema } from "@/features/profile/schema";
import { signupDraft } from "@/lib/auth/signupDraft";

type FormValues = z.infer<typeof educationSchema>;

export default function EducationPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      courseName: "",
      concentration: "",
      schoolName: "",
      gpa: "",
      gradYear: "",
    },
  });

  useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");

    const edu = draft.education?.[0];
    if (edu) {
      if (edu.courseName) form.setValue("courseName", edu.courseName);
      if (edu.concentration) form.setValue("concentration", edu.concentration);
      if (edu.schoolName) form.setValue("schoolName", edu.schoolName);
      if (edu.gpa !== undefined) form.setValue("gpa", edu.gpa);
      if (edu.gradYear) form.setValue("gradYear", edu.gradYear);
    }
  }, [form, router]);

  function onSubmit(values: FormValues) {
    const newEdu = {
      courseName: values.courseName,
      concentration: values.concentration,
      schoolName: values.schoolName,
      gpa: values.gpa,
      gradYear: values.gradYear,
    };
    
    signupDraft.set({
      education: [newEdu],
    });
    router.push("/experience");
  }

  return (
    <GlassCard>
      <h2 className="text-center text-xl font-semibold text-heading">Education</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Course Name*</Label>
            <Input placeholder="MS Computer Science" {...form.register("courseName")} />
            {form.formState.errors.courseName && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.courseName.message}</p>
            )}
          </div>

          <div>
            <Label>Concentration*</Label>
            <Input placeholder="AI / Systems / ..." {...form.register("concentration")} />
            {form.formState.errors.concentration && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.concentration.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label>School Name*</Label>
          <Input placeholder="California State University East Bay" {...form.register("schoolName")} />
          {form.formState.errors.schoolName && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.schoolName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>GPA</Label>
            <Input placeholder="3.8" {...form.register("gpa")} />
            {form.formState.errors.gpa && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.gpa.message}</p>
            )}
          </div>
          <div>
            <Label>Grad Year*</Label>
            <Input placeholder="2026" {...form.register("gradYear")} />
            {form.formState.errors.gradYear && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.gradYear.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Next →
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
