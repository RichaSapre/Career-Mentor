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

          <div className="w-36 h-36 rounded-full bg-[#0F172A]/40 border border-slate-800/50 overflow-hidden shadow-2xl">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                No Photo
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="absolute -bottom-2 -right-2 bg-cyan-600 text-white text-xs px-5 py-2 rounded-full shadow-xl hover:bg-cyan-500 hover:scale-110 transition-all font-bold"
          >
            Edit
          </button>
        </div>

        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
            {draft.full_name || "Your Name"}
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">
            {draft.email || "your@email.com"}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Education */}
        <GlassCard className="p-10 min-h-[220px] border-slate-800/50">
          <h2 className="text-xl font-bold mb-8 text-zinc-200">Education</h2>

          {draft.education?.length ? (
            draft.education.map((edu: any, index: number) => (
              <div key={index} className="mb-8 last:mb-0">
                <p className="font-bold text-lg text-zinc-100">
                  {edu.courseName}
                </p>
                <p className="text-zinc-400 mt-1">
                  {edu.schoolName}
                </p>
                <p className="text-zinc-600 text-xs mt-2 font-medium uppercase tracking-wider">
                  {edu.concentration} • GPA: {edu.gpa} • {edu.gradYear}
                </p>
              </div>
            ))
          ) : (
            <p className="text-zinc-600 italic">No education added yet.</p>
          )}
        </GlassCard>

        {/* Experience */}
        <GlassCard className="p-10 min-h-[220px] border-slate-800/50">
          <h2 className="text-xl font-bold mb-8 text-zinc-200">Experience</h2>

          {draft.experiences?.length ? (
            draft.experiences.map((exp: any, index: number) => (
              <div key={index} className="mb-8 last:mb-0">
                <p className="font-bold text-lg text-zinc-100">
                  {exp.title}
                </p>
                <p className="text-zinc-400 mt-1">
                  {exp.company}
                </p>
                <p className="text-zinc-600 text-xs mt-2 font-medium uppercase tracking-wider">
                  {exp.duration}
                </p>
              </div>
            ))
          ) : (
            <p className="text-zinc-600 italic">No experience added yet.</p>
          )}
        </GlassCard>

        {/* Skills */}
        <GlassCard className="p-10 md:col-span-2 min-h-[200px] border-slate-800/50">
          <h2 className="text-xl font-bold mb-8 text-zinc-200">Skills</h2>

          {draft.skills?.length ? (
            <div className="flex flex-wrap gap-3">
              {draft.skills.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-5 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-sm text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all font-medium"
                >
                  {typeof skill === "string"
                    ? skill
                    : skill.skill_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 italic">No skills added yet.</p>
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