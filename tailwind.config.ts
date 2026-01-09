import type { Config } from "tailwindcss";

/**
 * OpenConstructionEstimate - Calm Tech Design System
 *
 * This configuration implements a premium, serene aesthetic inspired by
 * Linear, Vercel, and Apple. Every token is crafted for visual harmony.
 *
 * Design Philosophy:
 * - Soft shadows over harsh borders
 * - Generous curves for organic warmth
 * - Restrained color palette for calm focus
 * - Purposeful animation for delightful interactions
 */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ============================================
         COLOR SYSTEM - The Premium Palette
         ============================================ */
      colors: {
        // Background Surfaces
        paper: "#FFFFFF",
        cloud: "#EEEEF0",  // Slightly darker for better contrast
        mist: "#F5F5F7",

        // Text Hierarchy - Never pure black
        "soft-black": "#1A1A1A",
        "carbon": "#1D1D1F",
        "muted": "#666666",
        "subtle": "#6E6E73",
        "whisper": "#AEAEB2",
        "ghost": "#C7C7CC",

        // Borders & Dividers - Minimal visibility
        "divider": "#E5E5E7",
        "border-soft": "#EBEBED",
        "border-muted": "#F0F0F2",

        // Accent Colors - Professional & Trustworthy
        accent: {
          DEFAULT: "#0066CC",
          50: "#E5F2FF",
          100: "#CCE5FF",
          200: "#99CCFF",
          300: "#66B2FF",
          400: "#3399FF",
          500: "#0066CC",
          600: "#0052A3",
          700: "#003D7A",
          800: "#002952",
          900: "#001429",
        },

        // Semantic Colors - Soft variations
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          muted: "#6EE7B7",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          muted: "#FCD34D",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          muted: "#FCA5A5",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          muted: "#93C5FD",
        },

        // Construction-specific semantic colors
        construction: {
          steel: "#71717A",
          concrete: "#A1A1AA",
          wood: "#D97706",
          glass: "#0EA5E9",
          electrical: "#FBBF24",
          plumbing: "#3B82F6",
          hvac: "#10B981",
        },
      },

      /* ============================================
         SHADOW SYSTEM - Soft Shadows
         Multi-layer shadows for natural depth
         ============================================ */
      boxShadow: {
        // Soft shadow progression - visible but elegant
        "soft-xs": "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "soft-sm": "0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)",
        "soft-md": "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.06)",
        "soft-lg": "0 8px 24px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.06)",
        "soft-xl": "0 16px 40px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.06)",
        "soft-2xl": "0 24px 56px rgba(0, 0, 0, 0.14), 0 12px 28px rgba(0, 0, 0, 0.08)",

        // Glow effects for focus and accent states
        "glow": "0 0 24px rgba(0, 102, 204, 0.25)",
        "glow-sm": "0 0 12px rgba(0, 102, 204, 0.15)",
        "glow-lg": "0 0 48px rgba(0, 102, 204, 0.30)",
        "glow-success": "0 0 24px rgba(16, 185, 129, 0.25)",
        "glow-error": "0 0 24px rgba(239, 68, 68, 0.25)",

        // Elevated cards - floating effect
        "elevated": "0 4px 16px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.06)",
        "elevated-lg": "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)",

        // Inner shadows for inset elements
        "inner-soft": "inset 0 1px 3px rgba(0, 0, 0, 0.06)",
        "inner-md": "inset 0 2px 6px rgba(0, 0, 0, 0.08)",
      },

      /* ============================================
         BORDER RADIUS - Generous Curves
         Organic, welcoming shapes
         ============================================ */
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      /* ============================================
         TYPOGRAPHY - Font Families
         Inter Tight for UI, Geist Mono for data
         ============================================ */
      fontFamily: {
        sans: [
          "Inter Tight",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "JetBrains Mono",
          "SF Mono",
          "Menlo",
          "Monaco",
          "monospace",
        ],
        display: [
          "Inter Tight",
          "Inter",
          "sans-serif",
        ],
      },

      /* ============================================
         FONT SIZES - Refined Scale
         Optimized for readability and hierarchy
         ============================================ */
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "xs": ["0.75rem", { lineHeight: "1rem" }],
        "sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "base": ["1rem", { lineHeight: "1.5rem" }],
        "lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.15" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
      },

      /* ============================================
         SPACING - Generous Breathing Room
         Calm layouts need space to breathe
         ============================================ */
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
      },

      /* ============================================
         ANIMATIONS - Purposeful Motion
         Framer Motion integration ready
         ============================================ */
      animation: {
        // Entrance animations
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "fade-in-down": "fadeInDown 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",

        // Continuous animations
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",

        // Micro-interactions
        "bounce-soft": "bounceSoft 0.4s ease-out",
        "wiggle": "wiggle 0.3s ease-in-out",

        // Loading states
        "skeleton": "skeleton 1.5s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-2deg)" },
          "75%": { transform: "rotate(2deg)" },
        },
        skeleton: {
          "0%": { backgroundColor: "#F5F5F7" },
          "50%": { backgroundColor: "#EBEBED" },
          "100%": { backgroundColor: "#F5F5F7" },
        },
      },

      /* ============================================
         TRANSITIONS - Smooth State Changes
         ============================================ */
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        "ease-soft": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "ease-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      /* ============================================
         BACKDROP BLUR - Frosted Glass Effects
         ============================================ */
      backdropBlur: {
        xs: "2px",
      },

      /* ============================================
         Z-INDEX - Layering System
         ============================================ */
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },

      /* ============================================
         MAX WIDTH - Content Constraints
         ============================================ */
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      /* ============================================
         ASPECT RATIO - Common Ratios
         ============================================ */
      aspectRatio: {
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "2/1": "2 / 1",
        "golden": "1.618 / 1",
      },
    },
  },
  plugins: [],
};

export default config;
