module.exports = {
  content: ["./src/**/*.{astro,js,ts,jsx,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
