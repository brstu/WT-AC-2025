/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",     // если index.html рядом
    "./src/src/**/*.{js,ts,jsx,tsx}"  // ВАЖНО
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
