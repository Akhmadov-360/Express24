/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,vue,html,svelte}",
    "./src/JavaScript/**/*.js",
    "./src/Pages/*.html",
  ],
  theme: {
    fontFamily: {
      'Inter': ['Inter', 'sans-serif']
    },
    extend: {},
  },
  plugins: [],
}

