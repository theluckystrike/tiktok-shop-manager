/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        tiktok: {
          red: '#FE2C55',
          cyan: '#25F4EE',
          black: '#000000',
          dark: '#121212',
          gray: '#161823',
        }
      }
    },
  },
  plugins: [],
}
