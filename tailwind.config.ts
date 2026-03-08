import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      /*
       * Semantic colour tokens.
       * Every utility (text-heading, bg-surface, border-border, etc.)
       * resolves to a CSS custom-property defined in globals.css.
       * Changing the palette requires editing ONLY globals.css.
       */
      colors: {
        brand: {
          DEFAULT: "#0A6B6A",
          dark: "#074E4D"
        },

        /* Semantic surface / background */
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        "surface-inset": "var(--surface-inset)",

        /* Semantic text */
        heading: "var(--heading)",
        body: "var(--body)",
        muted: "var(--muted)",
        faint: "var(--faint)",

        /* Semantic border */
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        divider: "var(--divider)",

        /* Accent */
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",

        /* Overlay */
        overlay: "var(--overlay)",

        /* Badge tokens */
        "badge-success-bg": "var(--badge-success-bg)",
        "badge-success-border": "var(--badge-success-border)",
        "badge-success-text": "var(--badge-success-text)",
        "badge-info-bg": "var(--badge-info-bg)",
        "badge-info-border": "var(--badge-info-border)",
        "badge-info-text": "var(--badge-info-text)",

        /* Tag / chip tokens */
        "tag-bg": "var(--tag-bg)",
        "tag-border": "var(--tag-border)",
        "tag-text": "var(--tag-text)",
        "tag-hover-bg": "var(--tag-hover-bg)",
        "tag-hover-border": "var(--tag-hover-border)",
        "tag-hover-text": "var(--tag-hover-text)",

        /* Form controls */
        "input-bg": "var(--input-bg)",
        "input-border": "var(--input-border)",
        "input-text": "var(--input-text)",
        "input-placeholder": "var(--input-placeholder)",
        "input-focus-ring": "var(--input-focus-ring)",

        /* Button tokens */
        "btn-primary-bg": "var(--btn-primary-bg)",
        "btn-primary-hover": "var(--btn-primary-hover)",
        "btn-primary-text": "var(--btn-primary-text)",
        "btn-ghost-bg": "var(--btn-ghost-bg)",
        "btn-ghost-hover": "var(--btn-ghost-hover)",
        "btn-ghost-text": "var(--btn-ghost-text)",
        "btn-secondary-bg": "var(--btn-secondary-bg)",
        "btn-secondary-hover": "var(--btn-secondary-hover)",
        "btn-secondary-text": "var(--btn-secondary-text)",
        "btn-secondary-border": "var(--btn-secondary-border)",
      },

      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
        'glow-primary': "var(--shadow-glow-primary)",
        'glow-secondary': "var(--shadow-glow-secondary)",
      },

      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    }
  },
  plugins: []
} satisfies Config;
