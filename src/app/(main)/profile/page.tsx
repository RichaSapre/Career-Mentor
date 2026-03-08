"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/glass/GlassCard";
import { signupDraft } from "@/lib/auth/signupDraft";
import ProfilePhotoModal from "@/components/profile/ProfilePhotoModal";

export default function ProfilePage() {
  const [draft, setDraft] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const data = signupDraft.get();
    setDraft(data);

    if (data.profilePhoto) {
      setImagePreview(data.profilePhoto);
    }
  }, []);

  return (
    <div className="flex flex-col gap-12">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative">

          <div className="w-40 h-40 rounded-full bg-surface border border-border overflow-hidden shadow-elevated transition-all">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-faint text-sm italic font-medium">
                No Photo
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="absolute bottom-2 right-2 bg-btn-primary-bg text-btn-primary-text text-xs px-6 py-2.5 rounded-full shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)] hover:bg-btn-primary-hover hover:scale-110 transition-all font-bold"
          >
            Edit
          </button>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] tracking-tight italic">
            {draft.full_name || "Your Name"}
          </h1>
          <p className="text-muted mt-2 font-black italic">
            {draft.email || "your@email.com"}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Education */}
        <GlassCard className="p-10 min-h-[220px] shadow-card">
          <h2 className="text-xl font-black mb-8 text-heading italic">Education</h2>

          {draft.education?.length ? (
            draft.education.map((edu: any, index: number) => (
              <div key={index} className="mb-8 last:mb-0">
                <p className="font-bold text-lg text-heading italic">
                  {edu.courseName}
                </p>
                <p className="text-muted mt-1 font-bold">
                  {edu.schoolName}
                </p>
                <p className="text-faint text-xs mt-2 font-black uppercase tracking-widest italic">
                  {edu.concentration} • GPA: {edu.gpa} • {edu.gradYear}
                </p>
              </div>
            ))
          ) : (
            <p className="text-faint italic font-medium">No education added yet.</p>
          )}
        </GlassCard>

        {/* Experience */}
        <GlassCard className="p-10 min-h-[220px] shadow-card">
          <h2 className="text-xl font-black mb-8 text-heading italic">Experience</h2>

          {draft.experiences?.length ? (
            draft.experiences.map((exp: any, index: number) => (
              <div key={index} className="mb-8 last:mb-0">
                <p className="font-bold text-lg text-heading italic">
                  {exp.title}
                </p>
                <p className="text-muted mt-1 font-bold">
                  {exp.company}
                </p>
                <p className="text-faint text-xs mt-2 font-black uppercase tracking-widest italic">
                  {exp.duration}
                </p>
              </div>
            ))
          ) : (
            <p className="text-faint italic font-medium">No experience added yet.</p>
          )}
        </GlassCard>

        {/* Skills */}
        <GlassCard className="p-10 md:col-span-2 min-h-[200px] shadow-card">
          <h2 className="text-xl font-black mb-8 text-heading italic">Skills</h2>

          {draft.skills?.length ? (
            <div className="flex flex-wrap gap-3">
              {draft.skills.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-5 py-2.5 bg-tag-bg border border-tag-border rounded-xl text-sm font-black text-tag-text hover:text-tag-hover-text hover:border-tag-hover-border hover:bg-tag-hover-bg transition-all shadow-sm"
                >
                  {typeof skill === "string"
                    ? skill
                    : skill.skill_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-faint italic font-medium">No skills added yet.</p>
          )}
        </GlassCard>

      </div>

      {/* Modal */}
      {showModal && (
        <ProfilePhotoModal
          onClose={() => setShowModal(false)}
          onSelect={(img) => setImagePreview(img)}
        />
      )}
    </div>
  );
}