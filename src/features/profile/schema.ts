import { z } from "zod";

// ── Step 1: Account & Education ──
export const signupStep1Schema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    degreeLevel: z.string().min(1, "Degree level is required"),
    major: z.string().min(2, "Major is required"),
    university: z.string().min(2, "University name is required"),
    graduationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    gpa: z
      .number()
      .optional()
      .refine((v) => v === undefined || (v >= 0 && v <= 4), {
        message: "GPA must be between 0 and 4",
      }),
    citizenshipStatus: z.string().min(1, "Select your visa / work authorization status"),
    needsSponsorship: z.boolean().default(false),
  })
  .refine((data) => /[a-z]/.test(data.password), {
    message: "Password needs at least one lowercase letter",
    path: ["password"],
  })
  .refine((data) => /[A-Z]/.test(data.password), {
    message: "Password needs at least one uppercase letter",
    path: ["password"],
  })
  .refine((data) => /[0-9]/.test(data.password), {
    message: "Password needs at least one number",
    path: ["password"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Step 2: Skills & Career ──
export const signupStep2Schema = z.object({
  skills: z
    .array(
      z.object({
        skillName: z.string().min(1),
        proficiencyLevel: z.number().min(1).max(5).default(3),
      })
    )
    .min(4, "Please add at least 4 skills"),
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
        duration: z.string().optional(),
        isCurrent: z.boolean().optional(),
      })
    )
    .default([]),
  targetRoles: z.array(z.string()).min(1, "Add at least 1 target role"),
  preferredLocations: z.array(z.string()).min(1, "Add at least 1 preferred location"),
  remotePreference: z.string().min(1, "Select your remote preference"),
  industryPreferences: z.array(z.string()).default([]),
  relocationWillingness: z.boolean().default(false),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

// ── Legacy schemas (kept for backward compatibility with onboarding pages) ──

export const educationSchema = z.object({
  degreeLevel: z.string().min(1, "Degree level is required"),
  major: z.string().min(2, "Major/Concentration is required"),
  university: z.string().min(2, "University name is required"),
  graduationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  gpa: z
    .number()
    .optional()
    .refine((v) => v === undefined || (v >= 0 && v <= 4), {
      message: "GPA must be between 0 and 4",
    }),
});

export const experienceItemSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company is required"),
  description: z.string().optional(),
  month: z.string().min(1, "Month is required"),
  year: z.string().regex(/^\d{4}$/, "Use YYYY"),
  techStack: z.string().optional(),
  duration: z.string().optional(),
  isCurrent: z.boolean().optional(),
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
          duration: z.string().optional(),
          isCurrent: z.boolean().optional(),
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
