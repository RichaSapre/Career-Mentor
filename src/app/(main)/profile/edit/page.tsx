"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/features/auth/hooks";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ArrowLeft } from "lucide-react";

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    major: "",
    university: "",
    graduationDate: "",
    gpa: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? (user as any).full_name ?? "",
        major: user.major ?? (user as any).major ?? "",
        university: user.university ?? (user as any).university ?? "",
        graduationDate: user.graduationDate ?? (user as any).graduation_date ?? "",
        gpa: user.gpa != null ? String(user.gpa) : "",
        linkedinUrl: user.linkedinUrl ?? (user as any).linkedin_url ?? "",
        githubUrl: user.githubUrl ?? (user as any).github_url ?? "",
        portfolioUrl: user.portfolioUrl ?? (user as any).portfolio_url ?? "",
      });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {
        fullName: form.fullName,
        major: form.major || undefined,
        university: form.university || undefined,
        graduationDate: form.graduationDate || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        githubUrl: form.githubUrl || undefined,
        portfolioUrl: form.portfolioUrl || undefined,
      };
      if (form.gpa) payload.gpa = parseFloat(form.gpa);
      await apiFetch(API.patchProfile, {
        method: "PATCH",
        body: JSON.stringify(payload),
        auth: true,
      });
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-heading mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <GlassCard className="p-8">
        <h1 className="text-2xl font-black text-heading mb-6 italic">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Full Name</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Your name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>Major</Label>
            <Input
              value={form.major}
              onChange={(e) => setForm((f) => ({ ...f, major: e.target.value }))}
              placeholder="e.g. Computer Science"
              className="mt-1"
            />
          </div>

          <div>
            <Label>University</Label>
            <Input
              value={form.university}
              onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
              placeholder="e.g. CSU East Bay"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Graduation Date</Label>
              <Input
                type="date"
                value={form.graduationDate}
                onChange={(e) => setForm((f) => ({ ...f, graduationDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>GPA</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={form.gpa}
                onChange={(e) => setForm((f) => ({ ...f, gpa: e.target.value }))}
                placeholder="3.5"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>LinkedIn URL</Label>
            <Input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/yourprofile"
              className="mt-1"
            />
          </div>

          <div>
            <Label>GitHub URL</Label>
            <Input
              type="url"
              value={form.githubUrl}
              onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
              placeholder="https://github.com/yourusername"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Portfolio URL</Label>
            <Input
              type="url"
              value={form.portfolioUrl}
              onChange={(e) => setForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
              placeholder="https://yourportfolio.dev"
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
