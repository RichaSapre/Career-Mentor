"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/GlassCard";
import { signupDraft } from "@/lib/auth/signupDraft";
import ProfilePhotoModal from "@/components/profile/ProfilePhotoModal";
import { useMe } from "@/features/auth/hooks";
import { 
  Briefcase, 
  MapPin, 
  Globe, 
  Building2, 
  GraduationCap, 
  Banknote, 
  FileCheck,
  PlaneTakeoff,
  Code
} from "lucide-react";

function formatCurrency(n: number) {
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const draft = signupDraft.get();
  
  // Basic info mapping
  const displayName = user?.fullName ?? (user as any)?.full_name ?? draft.fullName ?? "Your Name";
  const displayEmail = user?.email ?? draft.email ?? "your@email.com";
  
  // Education mapping
  const education = user
    ? [{ 
        courseName: `${user.degreeLevel ?? ""} ${user.major ?? ""}`.trim(), 
        schoolName: user.university, 
        concentration: user.major, 
        gpa: user.gpa, 
        gradYear: user.graduationDate?.slice(0, 4) 
      }].filter((e) => e.schoolName)
    : (draft.university ? [{ 
        courseName: `${draft.degreeLevel ?? ""} ${draft.major ?? ""}`.trim(), 
        schoolName: draft.university, 
        concentration: draft.major, 
        gpa: draft.gpa, 
        gradYear: draft.graduationDate?.slice(0, 4) 
      }] : []);
      
  const experiences = user?.experiences ?? draft.experiences ?? [];
  const skills = user?.skills ?? [];

  useEffect(() => {
    if (draft.profilePhoto) setImagePreview(draft.profilePhoto);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-accent-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-20">

      {/* Header Section */}
      <GlassCard className="p-10 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-card relative overflow-hidden">
        {/* Subtle background gradient based on prestige/activity could go here */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full bg-surface border-4 border-surface shadow-elevated overflow-hidden transition-all">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-faint text-sm font-medium bg-surface-inset">
                No Photo
              </div>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="absolute bottom-0 right-0 bg-btn-primary-bg text-btn-primary-text text-xs px-4 py-1.5 rounded-full shadow-glow-primary hover:bg-btn-primary-hover hover:scale-105 transition-all font-bold"
          >
            Edit
          </button>
        </div>

        <div className="text-center md:text-left flex-1 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] tracking-tight">
                {displayName}
              </h1>
              <p className="text-muted mt-1 font-medium">{displayEmail}</p>
            </div>
            
            <button
              onClick={() => router.push("/profile/edit")}
              className="px-5 py-2.5 rounded-xl bg-btn-secondary-bg border border-btn-secondary-border text-btn-secondary-text font-bold hover:bg-btn-secondary-hover transition-all text-sm shrink-0"
            >
              Edit Profile
            </button>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {user?.citizenshipStatus && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-inset border border-border text-xs font-semibold text-heading">
                <Globe className="w-3.5 h-3.5 text-accent-primary" />
                {user.citizenshipStatus}
              </span>
            )}
            {user?.needsSponsorship !== undefined && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-inset border border-border text-xs font-semibold text-heading">
                <FileCheck className="w-3.5 h-3.5 text-accent-primary" />
                {user.needsSponsorship ? "Requires Sponsorship" : "No Sponsorship Needed"}
              </span>
            )}
            {user?.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-xs font-semibold text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Preferences */}
        <div className="md:col-span-1 space-y-8">
          <GlassCard className="p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-accent-primary" /> Target Roles
            </h2>
            {user?.targetRoles?.length ? (
              <div className="flex flex-col gap-2">
                {user.targetRoles.map((role: string, i: number) => (
                  <div key={i} className="px-3 py-2 bg-tag-bg border border-tag-border rounded-lg text-sm font-medium text-tag-text">
                    {role}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">No target roles specified.</p>
            )}
          </GlassCard>

          <GlassCard className="p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-faint flex items-center gap-2">
              Preferences
            </h2>
            
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-2">
                <Banknote className="w-3.5 h-3.5" /> Expected Salary
              </div>
              <div className="text-sm font-medium text-heading">
                {user?.salaryRange 
                  ? `${formatCurrency(user.salaryRange.min)} - ${formatCurrency(user.salaryRange.max)} ${user.salaryRange.currency}`
                  : "Not specified"}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-2">
                <MapPin className="w-3.5 h-3.5" /> Locations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user?.preferredLocations?.length ? (
                  user.preferredLocations.map((loc: string, i: number) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 rounded bg-surface-inset border border-border">{loc}</span>
                  ))
                ) : (
                  <span className="text-sm text-faint">Not specified</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Remote</div>
                <div className="text-sm font-medium text-heading">{user?.remotePreference || "Any"}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  <PlaneTakeoff className="w-3 h-3" /> Relocation
                </div>
                <div className="text-sm font-medium text-heading">
                  {user?.relocationWillingness ? "Willing" : "Not Willing"}
                </div>
              </div>
            </div>

            {user?.industryPreferences?.length ? (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  <Building2 className="w-3.5 h-3.5" /> Industries
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.industryPreferences.map((ind: string, i: number) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 rounded bg-surface-inset border border-border">{ind}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </GlassCard>
        </div>

        {/* Right Column: Education, Experience, Skills */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Education */}
          <GlassCard className="p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-6 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent-primary" /> Education
            </h2>
            {education?.length ? (
              <div className="space-y-6">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl bg-surface-inset/50 border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-heading">{edu.courseName}</h3>
                      <p className="text-muted font-medium">{edu.schoolName}</p>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2 text-xs font-semibold text-faint uppercase tracking-wider">
                        {edu.concentration && <span>{edu.concentration}</span>}
                        {edu.gpa && <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">GPA: {edu.gpa}</span>}
                        {edu.gradYear && <span>Class of {edu.gradYear}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">No education added yet.</p>
            )}
          </GlassCard>

          {/* Experience */}
          <GlassCard className="p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-accent-primary" /> Experience
            </h2>
            {experiences?.length ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {experiences.map((exp: any, index: number) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-accent-primary shrink-0 relative z-10 shadow-sm">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface-inset/50 border border-border/50 shadow-sm ml-4 md:ml-0 md:group-odd:mr-4 md:group-even:ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-heading text-lg">{exp.title}</h3>
                      </div>
                      <div className="text-muted font-medium">{exp.company}</div>
                      <time className="block text-xs font-semibold text-faint uppercase tracking-wider mt-2">{exp.duration}</time>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">No experience added yet.</p>
            )}
          </GlassCard>

          {/* Skills */}
          <GlassCard className="p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-6 flex items-center gap-2">
              <Code className="w-4 h-4 text-accent-primary" /> Technical Skills
            </h2>
            {skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, index: number) => {
                  const name = typeof skill === "string" ? skill : (skill.skillName ?? skill.skill_name);
                  const level = typeof skill === "object" ? skill.proficiencyLevel : null;
                  
                  return (
                    <div
                      key={index}
                      className="px-4 py-2 bg-surface-inset border border-border rounded-xl text-sm font-semibold text-heading flex items-center gap-2"
                    >
                      {name}
                      {level && (
                        <div className="flex gap-0.5 ml-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div 
                              key={lvl} 
                              className={`w-1.5 h-1.5 rounded-full ${lvl <= level ? "bg-accent-primary" : "bg-border"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-faint">No skills added yet.</p>
            )}
          </GlassCard>

        </div>
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