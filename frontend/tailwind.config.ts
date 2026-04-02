import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Game specific colors
        sky: {
          light: "hsl(var(--sky-light))",
          medium: "hsl(var(--sky-medium))",
          dark: "hsl(var(--sky-dark))",
        },
        cloud: {
          white: "hsl(var(--cloud-white))",
          shadow: "hsl(var(--cloud-shadow))",
        },
        island: {
          green: "hsl(var(--island-green))",
          brown: "hsl(var(--island-brown))",
        },
        firefly: {
          glow: "hsl(var(--firefly-glow))",
          core: "hsl(var(--firefly-core))",
        },
        crystal: {
          red: "hsl(var(--crystal-red))",
          blue: "hsl(var(--crystal-blue))",
          green: "hsl(var(--crystal-green))",
          yellow: "hsl(var(--crystal-yellow))",
        },
        star: {
          gold: "hsl(var(--star-gold))",
          silver: "hsl(var(--star-silver))",
        },
        seed: {
          spark: "hsl(var(--seed-spark))",
          logic: "hsl(var(--seed-logic))",
          harmony: "hsl(var(--seed-harmony))",
        },
        mindling: {
          pip: "hsl(var(--mindling-pip))",
          mira: "hsl(var(--mindling-mira))",
          vee: "hsl(var(--mindling-vee))",
          nuo: "hsl(var(--mindling-nuo))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        game: "2rem",
        bubble: "3rem",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
        "glow-gold": "var(--shadow-glow-gold)",
        "glow-blue": "var(--shadow-glow-blue)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(-5%)", animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)" },
          "50%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
        pop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px hsl(var(--primary) / 0.5)" },
          "50%": { boxShadow: "0 0 25px hsl(var(--primary) / 0.8), 0 0 40px hsl(var(--primary) / 0.4)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        wiggle: "wiggle 0.5s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
        sparkle: "sparkle 1.5s ease-in-out infinite",
        pop: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        shake: "shake 0.5s ease-in-out",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
