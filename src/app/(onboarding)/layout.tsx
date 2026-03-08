"use client";

import { usePathname } from "next/navigation";

const steps = [
  { href: "/education", label: "Education" },
  { href: "/experience", label: "Experience" },
  { href: "/skills", label: "Skills" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const idx = steps.findIndex((s) => s.href === pathname);

  return (
    <main className="bg-gradient-soft min-h-screen px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <div className="text-xs text-muted">Onboarding</div>
          <div className="mt-1 flex items-center gap-2">
            {steps.map((s, i) => (
              <div
                key={s.href}
                className={
                  "h-2 flex-1 rounded-full " +
                  (i <= idx ? "bg-accent-primary" : "bg-border")
                }
              />
            ))}
          </div>
          <div className="mt-2 text-sm font-medium text-body">
            {idx >= 0 ? `Step ${idx + 1} of ${steps.length}: ${steps[idx].label}` : ""}
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
