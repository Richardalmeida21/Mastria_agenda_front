/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000", // Preto
        secondary: "#ffffff", // Branco
        accent: "#d4af37", // Dourado
      },
    },
  },
  plugins: [],
}
