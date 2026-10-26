/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          dark: '#0f172a',
          sidebar: '#1e293b',
          sidebarHover: '#334155',
          sidebarActive: '#2563eb',
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          textMuted: '#64748b',
          textDark: '#0f172a',
          primary: '#1d4ed8',
          primaryHover: '#1e40af',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
