/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060A14",
          900: "#0B1220",
          800: "#141D32",
          700: "#1D2B4A",
          600: "#273D6B",
        },
        primary: "#3B82F6",    // Electric Blue
        secondary: "#8B5CF6",  // Soft Purple
        accent: "#22D3EE",     // Cyan
      },
      boxShadow: {
        glass: "0 18px 42px rgba(2, 8, 23, 0.45)",
        glow: "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.5)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      }
    },
  },
  plugins: [],
};
