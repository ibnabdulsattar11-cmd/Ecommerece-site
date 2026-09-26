/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef4fb",
          100: "#d7e6f4",
          200: "#b0cde9",
          300: "#7fabd8",
          400: "#4d84c2",
          500: "#2e63a3",
          600: "#1e3a5f", // brand base
          700: "#182f4c",
          800: "#13253c",
          900: "#0f1e30",
          DEFAULT: "#1e3a5f",
          light: "#3a6ea5",
          dark: "#0f2540",
        },
        accent: {
          50: "#fdf6ea",
          100: "#faeac8",
          200: "#f4d492",
          300: "#edb95c",
          400: "#e8a33d",
          500: "#d98a1f",
          600: "#b66c17",
          DEFAULT: "#e8a33d",
        },
        success: { DEFAULT: "#1e8e5a", light: "#e6f6ee" },
        danger: { DEFAULT: "#c0392b", light: "#fdecea" },
        warning: { DEFAULT: "#b8860b", light: "#fdf3e0" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 30, 48, 0.06), 0 1px 3px 0 rgba(15, 30, 48, 0.08)",
        "card-hover": "0 4px 12px 0 rgba(15, 30, 48, 0.10)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
