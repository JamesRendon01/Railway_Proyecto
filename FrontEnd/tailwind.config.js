module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        marquee: "marquee 6s linear infinite",
      },
    },
  },
  plugins: [],
  future: {
    disableColorFunctions: true, // 🚫 Desactiva colores oklch()
  },
};
