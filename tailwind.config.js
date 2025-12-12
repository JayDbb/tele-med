/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5BB5E8",
        secondary: "#4A5568",
        accent: "#5664D2",
        "background-light": "#F3F6FD",
        "background-dark": "#1a202c",
        "card-light": "#ffffff",
        "card-dark": "#2d3748",
        "text-light": "#2D3748",
        "text-dark": "#E2E8F0",
        "text-muted-light": "#718096",
        "text-muted-dark": "#A0AEC0",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}