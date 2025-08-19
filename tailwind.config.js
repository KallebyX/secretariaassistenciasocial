/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'prefeitura-amarelo': 'rgb(245, 240, 80)',
        'prefeitura-verde': 'rgb(83, 168, 85)',
        'prefeitura-vermelho': 'rgb(218, 57, 50)',
      }
    },
  },
  plugins: [],
}
