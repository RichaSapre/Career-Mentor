import { z } from "zod";

export const educationSchema = z.object({
  courseName: z.string().min(2, "Course name is required"),
  concentration: z.string().min(2, "Concentration is required"),
  schoolName: z.string().min(2, "School name is required"),
  gpa: z
    .string()
    .optional()
    .refine((v) => !v || /^\d(\.\d+)?$/.test(v), {
      message: "Enter a valid GPA",
    }),
  gradYear: z.string().regex(/^\d{4}$/, "Use YYYY"),
});

export const experienceItemSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company is required"),
  description: z.string().optional(),
  month: z.string().min(1, "Month is required"),
  year: z.string().regex(/^\d{4}$/, "Use YYYY"),
  techStack: z.string().optional(),
});

export const experienceSchema = z
  .object({
    hasExperience: z.boolean().default(false),
    experiences: z
      .array(
        z.object({
          title: z.string().optional(),
          company: z.string().optional(),
          description: z.string().optional(),
          month: z.string().optional(),
          year: z.string().optional(),
          techStack: z.string().optional(),
        })
      )
      .default([]),
  })
  .superRefine((v, ctx) => {
    if (!v.hasExperience) return;

    if (!v.experiences || v.experiences.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["experiences"],
        message: "Please add at least one experience entry.",
      });
      return;
    }

    v.experiences.forEach((e, idx) => {
      const required: Array<[keyof typeof e, string]> = [
        ["title", "Job title is required"],
        ["company", "Company name is required"],
        ["month", "Month is required"],
        ["year", "Year is required"],
        ["description", "Description is required"],
      ];

      required.forEach(([key, msg]) => {
        if (!e[key] || String(e[key]).trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["experiences", idx, key],
            message: msg,
          });
        }
      });
    });
  });
export const skillsSchema = z.object({
  skills: z
    .array(z.object({ skillName: z.string().min(1) }))
    .min(4, "Please add at least 4 skills to continue."),
});
