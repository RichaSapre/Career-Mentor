export type SignupDraft = {
  full_name?: string;
  email?: string;
  password?: string;
  profilePhoto?: string | null; 

  education?: Array<{
    courseName?: string;
    schoolName?: string;
    concentration?: string;
    gpa?: string;
    gradYear?: string;
  }>;

  experiences?: Array<{
    title?: string;
    company?: string;
    description?: string;
    duration?: string;
    techStack?: string[];
    startDate?: string;   // ✅ important
    isCurrent?: boolean;
  }>;

  skills?: Array<
    | string
    | {
        skill_name?: string;
      }
  >;
};

const KEY = "signupDraft";

export const signupDraft = {
  get(): SignupDraft {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  },

  set(partial: Partial<SignupDraft>) {
    const current = this.get();
    const updated = { ...current, ...partial };
    localStorage.setItem(KEY, JSON.stringify(updated));
  },

  clear() {
    localStorage.removeItem(KEY);
  },
};