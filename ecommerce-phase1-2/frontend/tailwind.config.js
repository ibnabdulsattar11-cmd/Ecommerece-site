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
          DEFAULT: "#1e3a5f",
          light: "#3a6ea5",
          dark: "#0f2540",
        },
        accent: "#e8a33d",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
};
