/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // ← Important si tu as /src
  ],
  theme: {
    extend: {
      colors: {
        primaire: "#f5c400",     // Jaune
        secondaire: "#141414",   // Noir
        bg: "#f7f7f7",           // Fond
        accent1: "#aad7d4",
        accent2: "#3e878e",
        accent3: "#1e5363",
        accent4: "#f1887c",
        accent5: "#f9bd9b",
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        titre: ["'Glass Antiqua'", "cursive"],
      },
    },
  },
  plugins: [],
}
