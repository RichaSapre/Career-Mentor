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
      <div className="flex items-center gap-8">
        <div className="relative">

          <div className="w-36 h-36 rounded-full bg-white/10 border border-white/20 overflow-hidden shadow-lg">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/50 text-sm">
                No Photo
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="absolute -bottom-2 -right-2 bg-white text-black text-xs px-4 py-1 rounded-full shadow hover:scale-105 transition"
          >
            Edit
          </button>
        </div>

        <div>
          <h1 className="text-4xl font-bold">
            {draft.full_name || "Your Name"}
          </h1>
          <p className="text-white/60 mt-2">
            {draft.email || "your@email.com"}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Education */}
        <GlassCard className="p-8 min-h-[220px]">
          <h2 className="text-xl font-semibold mb-6">Education</h2>

          {draft.education?.length ? (
            draft.education.map((edu: any, index: number) => (
              <div key={index} className="mb-6">
                <p className="font-medium text-lg">
                  {edu.courseName}
                </p>
                <p className="text-white/60">
                  {edu.schoolName}
                </p>
                <p className="text-white/50 text-sm">
                  {edu.concentration} • GPA: {edu.gpa} • {edu.gradYear}
                </p>
              </div>
            ))
          ) : (
            <p className="text-white/50">No education added yet.</p>
          )}
        </GlassCard>

        {/* Experience */}
        <GlassCard className="p-8 min-h-[220px]">
          <h2 className="text-xl font-semibold mb-6">Experience</h2>

          {draft.experiences?.length ? (
            draft.experiences.map((exp: any, index: number) => (
              <div key={index} className="mb-6">
                <p className="font-medium text-lg">
                  {exp.title}
                </p>
                <p className="text-white/60">
                  {exp.company}
                </p>
                <p className="text-white/50 text-sm">
                  {exp.duration}
                </p>
              </div>
            ))
          ) : (
            <p className="text-white/50">No experience added yet.</p>
          )}
        </GlassCard>

        {/* Skills */}
        <GlassCard className="p-8 md:col-span-2 min-h-[200px]">
          <h2 className="text-xl font-semibold mb-6">Skills</h2>

          {draft.skills?.length ? (
            <div className="flex flex-wrap gap-3">
              {draft.skills.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition"
                >
                  {typeof skill === "string"
                    ? skill
                    : skill.skill_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white/50">No skills added yet.</p>
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