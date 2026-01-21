/ @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages//*.{ts,tsx}",
    "./components//*.{ts,tsx}",
    "./app//*.{ts,tsx}",
    "./src//*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'stapel' is the class name you will use (e.g., font-stapel)
        // 'var(--font-bold-font)' matches the variable defined in layout.tsx
        stapel: ["var(--font-bold-font)"],
        stapell: ["var(--font-regular-font)"],

      },
    },
  },
  plugins: [],
};